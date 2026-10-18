/*******************************************************************************
 * Danbooru Diffusion Prompt Builder
 * Copyright (C) 2022  Jabasukuriputo Wang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 ******************************************************************************/

import { defineStore } from 'pinia'
import type { Tag, Tags, CategoryHierarchy } from '../types/data'
import { useSettingsStore } from './settings'
import LRU from 'lru-cache'
import type { TagFile } from '../types/file'

const searchCache = new LRU<string, (Tag & { score: number })[]>({
    max: 50,
    allowStale: true,
    updateAgeOnGet: true,
})

export const useTagStore = defineStore('tags', {
    state: (): Tags => ({ tags: [], tagsPostCount: {} }),
    getters: {
        loaded: (state) => {
            return state.tags.length > 0
        },
        categoryHierarchy: (state) => {
            const settings = useSettingsStore()
            const dedup: Record<string, boolean> = {}
            const filtered = state.tags
                    .filter((t) => settings.showRestricted || !t.restricted)
                    .map(({ category }) => category.join('/'))
                    .filter(e=>!(dedup[e]=e in dedup))
                    .sort()
                    .map(e => e.split('/'))
            const hierarchy: CategoryHierarchy = {}
            for (const categoryList of filtered) {
                let parent = hierarchy
                for (const [i, category] of categoryList.entries()) {
                    if (i === categoryList.length - 1) {
                        parent[category] = true
                    } else {
                        const newParent = parent[category] ?? {}
                        parent[category] ||= newParent
                        if (typeof newParent === 'object') {
                            parent = newParent
                        }
                    }
                }
            }
            return hierarchy
        },
        tagsByCategory: (state): Record<string, Tag[]> => {
            const settings = useSettingsStore()
            return state.tags
                .filter((t) => settings.showRestricted || !t.restricted)
                .group((t) => t.category.join('/'))
        },
        categorySize: (state) => {
            const size: Record<string, number> = {}
            for (const tag of state.tags) {
                const key = tag.category.join('/')
                size[key] = (size[key] ?? 0) + 1
            }
            return size
        },
        allTags: (state) => {
            const settings = useSettingsStore()

            return Object.fromEntries(
                state.tags
                    .filter((t) => settings.showRestricted || !t.restricted)
                    .map((t) => [t.key, t])
            )
        },
        allTagsWithAlias: (state) => {
            const settings = useSettingsStore()

            return Object.fromEntries(
                state.tags
                    .filter((t) => settings.showRestricted || !t.restricted)
                    .flatMap((t) => {
                        if (t.alias) {
                            return [[t.key, t], ...t.alias.map((a) => [a, t])]
                        } else {
                            return [[t.key, t]]
                        }
                    })
            )
        },
        allTagCount: (state) => {
            const settings = useSettingsStore()
            return state.tags.filter(
                (t) => settings.showRestricted || !t.restricted
            ).length
        },
        tagWithPhotosCount: (state) => {
            const settings = useSettingsStore()
            return state.tags
                .filter((t) => settings.showRestricted || !t.restricted)
                .filter((t) => t.image).length
        },
    },
    actions: {
        async load() {
            const tags = import.meta.glob<TagFile>(
                '../../data/tags/**/*.yaml',
                { import: 'default' }
            )
            const result = await Promise.all(
                Object.values(tags).map((f) => f())
            )
            const tagsPostCount: Record<string, number> = (
                await import('../../data/danbooru_tag_post_count.json')
            ).default
            const tagData: Tags = {
                tags: result.flatMap((p) => {
                    return Object.entries(p.content).map<Tag>(([k, t]) => {
                        return {
                            ...t,
                            key: k.replaceAll('_', ' ').toLowerCase(),
                            category: [...p.category, p.name],
                            restricted: t.restricted || p.restricted,
                        }
                    })
                }),
                tagsPostCount,
            }

            this.$patch(tagData)
        },
        resolve(name: string) {
            name = name.replaceAll('_', ' ').toLowerCase()
            const meta = this.allTagsWithAlias[name]
            if (meta) {
                return { name: meta.originalName, meta }
            }
            return null
        },
        searchCategory(category: string[], query: string) {
            const settings = useSettingsStore()
            if (!this.tagsByCategory[category.join('/')]) return []

            if (query === '')
                return this.tagsByCategory[category.join('/')].sort(
                    (k1, k2) =>
                        (this.tagsPostCount[k2.key] ?? 0) -
                        (this.tagsPostCount[k1.key] ?? 0)
                )

            const lcQuery = query.toLowerCase().trim()
            const normalizedLcQuery = lcQuery
                .split(/_|\s/)
                .filter((n) => !!n)
            const cacheKey = JSON.stringify([
                'ByCategory',
                category,
                normalizedLcQuery,
            ])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached

            const catStr = category.join('/')
            const candidates = this.tagsByCategory[catStr] || []
            const results: (Tag & { score: number })[] = []

            for (let i = 0; i < candidates.length; i++) {
                const meta = candidates[i]
                let score = 0
                const tagKey = meta.key.toLowerCase()
                const tagName = meta.name ? meta.name.toLowerCase() : ''

                if (tagKey === lcQuery) score += 300
                if (tagName === lcQuery) score += 250

                let allMatched = true
                for (let k = 0; k < normalizedLcQuery.length; k++) {
                    const q = normalizedLcQuery[k]
                    let matched = false
                    if (tagKey.includes(q)) {
                        score += 100
                        matched = true
                    }
                    if (tagName.includes(q)) {
                        score += 70
                        matched = true
                    }
                    if (meta.alias) {
                        for (let a = 0; a < meta.alias.length; a++) {
                            const al = meta.alias[a].toLowerCase()
                            if (al === lcQuery) score += 150
                            if (al.includes(q)) {
                                score += 50
                                matched = true
                            }
                        }
                    }
                    if (meta.description && meta.description.toLowerCase().includes(q)) {
                        score += 25
                        matched = true
                    }
                    if (!matched) {
                        allMatched = false
                        break
                    }
                }
                if (allMatched && score > 0) {
                    const pc = this.tagsPostCount[meta.key] || 0
                    if (pc > 0) score += Math.min(Math.log10(pc + 1) * 5, 30)
                    results.push({ ...meta, score })
                }
            }

            results.sort((a, b) => b.score - a.score)
            searchCache.set(cacheKey, results)
            return results
        },
        searchAll(query: string, categoryFilter?: string) {
            const settings = useSettingsStore()
            if (!query || !query.trim()) return []

            const lcQuery = query.toLowerCase().trim()
            const normalizedLcQuery = lcQuery
                .split(/_|\s/)
                .filter((n) => !!n)
            const cacheKey = JSON.stringify(['Global', normalizedLcQuery, categoryFilter || '', settings.showRestricted])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached

            const tags = this.tags
            const tagsCount = tags.length
            const showRestricted = settings.showRestricted
            const filterCat = categoryFilter ? categoryFilter.toLowerCase() : ''
            const results: (Tag & { score: number })[] = []

            for (let i = 0; i < tagsCount; i++) {
                const meta = tags[i]
                if (!showRestricted && meta.restricted && filterCat !== '限制级') continue

                if (filterCat) {
                    let matchCat = false
                    if (meta.category) {
                        for (let c = 0; c < meta.category.length; c++) {
                            if (meta.category[c].toLowerCase().includes(filterCat)) {
                                matchCat = true
                                break
                            }
                        }
                    }
                    if (!matchCat) continue
                }

                let score = 0
                const tagKey = meta.key.toLowerCase()
                const tagName = meta.name ? meta.name.toLowerCase() : ''

                if (tagKey === lcQuery) score += 400
                if (tagName === lcQuery) score += 350

                let allMatched = true
                for (let k = 0; k < normalizedLcQuery.length; k++) {
                    const q = normalizedLcQuery[k]
                    let matched = false

                    if (tagKey.includes(q)) {
                        score += (tagKey === q ? 150 : 80)
                        matched = true
                    }
                    if (tagName.includes(q)) {
                        score += (tagName === q ? 120 : 60)
                        matched = true
                    }
                    if (meta.alias) {
                        for (let a = 0; a < meta.alias.length; a++) {
                            const al = meta.alias[a].toLowerCase()
                            if (al === lcQuery) score += 200
                            if (al.includes(q)) {
                                score += (al === q ? 100 : 50)
                                matched = true
                            }
                        }
                    }
                    if (meta.description && meta.description.toLowerCase().includes(q)) {
                        score += 25
                        matched = true
                    }
                    if (meta.category) {
                        for (let c = 0; c < meta.category.length; c++) {
                            if (meta.category[c].toLowerCase().includes(q)) {
                                score += 15
                                matched = true
                            }
                        }
                    }

                    if (!matched) {
                        allMatched = false
                        break
                    }
                }

                if (allMatched && score > 0) {
                    const pc = this.tagsPostCount[meta.key] || 0
                    if (pc > 0) {
                        score += Math.min(Math.log10(pc + 1) * 5, 30)
                    }
                    results.push({ ...meta, score })
                }
            }

            results.sort((a, b) => b.score - a.score)
            const trimmed = results.slice(0, 200)
            searchCache.set(cacheKey, trimmed)
            return trimmed
        },
    },
})
