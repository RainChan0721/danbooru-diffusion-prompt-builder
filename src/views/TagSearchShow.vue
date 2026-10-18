<!------------------------------------------------------------------------------
  - Danbooru Diffusion Prompt Builder
  - Copyright (C) 2022  Jabasukuriputo Wang
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <https://www.gnu.org/licenses/>.
  -
  ----------------------------------------------------------------------------->

<script lang="ts" setup>
import { ref, computed, watch, toRef, type Ref } from 'vue'
import { ElScrollbar } from 'element-plus'
import { useTagStore } from '../stores/tags'
import { useEmbeddingStore } from '../stores/embeddings'
import { useHypernetworkStore } from '../stores/hypernetworks'
import TagView from '../components/TagItem.vue'
import Masonry from '../components/Masonry.vue'
import { ClientOnly } from '../ClientOnly'
import { useSettingsStore } from '../stores/settings'
import type { Tag, Embedding, Hypernetwork } from '../types/data'
import EmbeddingView from '../components/EmbeddingItem.vue'
import HypernetworkView from '../components/HypernetworkItem.vue'

const props = withDefaults(
    defineProps<{
        search: string
        categoryFilter?: string
    }>(),
    {
        categoryFilter: '',
    }
)

const emit = defineEmits<{
    (e: 'update:categoryFilter', val: string): void
}>()

interface SearchResultTag {
    type: 'tag'
    key: string
    score: number
    data: Tag
}

interface SearchResultEmbedding {
    type: 'embedding'
    key: string
    score: number
    data: Embedding
}

interface SearchResultHypernetwork {
    type: 'hypernetwork'
    key: string
    score: number
    data: Hypernetwork
}

type SearchResult =
    | SearchResultTag
    | SearchResultEmbedding
    | SearchResultHypernetwork

const settingsStore = useSettingsStore()
const tagStore = useTagStore()
const embeddingStore = useEmbeddingStore()
const hypernetworkStore = useHypernetworkStore()

const categories = [
    { label: '全部', value: '' },
    { label: '🔞 限制级', value: '限制级' },
    { label: '画面构图', value: '画面构图' },
    { label: '服饰装扮', value: '服饰' },
    { label: '人物特征', value: '人物' },
    { label: '物品道具', value: '物品' },
    { label: '自然环境', value: '自然' },
    { label: '人文建筑', value: '人文' },
    { label: '热门画师', value: '画师' },
    { label: '负向/质量', value: '元标签' },
]

function selectCategory(cat: string) {
    emit('update:categoryFilter', cat)
}

const scrollRef: Ref<typeof ElScrollbar | null> = ref(null)
const paginationSize = ref(12)
const filteredTags = computed(() =>
    tagStore.searchAll(props.search, props.categoryFilter)
)
const filteredEmbeddings = computed(() =>
    props.categoryFilter ? [] : embeddingStore.searchAll(props.search)
)
const filteredHypernetworks = computed(() =>
    props.categoryFilter ? [] : hypernetworkStore.searchAll(props.search)
)

const combinedResult = computed(() => {
    const resultTag: SearchResult[] = filteredTags.value.map((n) => ({
        type: 'tag',
        data: n,
        key: n.key,
        score: n.score,
    }))
    const resultEmbedding: SearchResult[] = filteredEmbeddings.value.map(
        (n) => ({
            type: 'embedding',
            data: n,
            key: n.payloadHash,
            score: n.score,
        })
    )
    const resultHypernetwork: SearchResult[] = filteredHypernetworks.value.map(
        (n) => ({
            type: 'hypernetwork',
            data: n,
            key: `${n.prompt}-${n.name}-${n.author}-${n.previewHash}`,
            score: n.score,
        })
    )
    return resultTag
        .concat(resultEmbedding)
        .concat(resultHypernetwork)
        .sort(({ score: a }, { score: b }) => b - a)
})
const filteredLength = computed(() => combinedResult.value.length)
const paginatedResult = computed(() =>
    combinedResult.value.slice(0, paginationSize.value)
)
function loadMore() {
    if (paginationSize.value < filteredLength.value) {
        paginationSize.value += 20
    }
}
watch([toRef(props, 'search'), toRef(props, 'categoryFilter')], () => {
    paginationSize.value = 12
    scrollRef.value?.scrollTo({ top: 0 })
})
</script>

<template>
    <div class="search-header">
        <div class="search-title-row">
            <h1 class="search-title">搜索结果</h1>
            <span class="search-count">找到 {{ filteredLength }} 个匹配项</span>
        </div>
        <div class="search-category-pills">
            <button
                v-for="cat in categories"
                :key="cat.value"
                type="button"
                :class="[
                    'category-pill',
                    { active: (props.categoryFilter || '') === cat.value },
                ]"
                @click="selectCategory(cat.value)">
                {{ cat.label }}
            </button>
        </div>
    </div>
    <ElScrollbar ref="scrollRef" class="scrollable">
        <ClientOnly>
            <Masonry
                v-infinite-scroll="loadMore"
                :bind="[paginatedResult, settingsStore.showImage]"
                :infinite-scroll-disabled="paginationSize >= filteredLength"
                :infinite-scroll-distance="128"
                :infinite-scroll-delay="10">
                <template v-for="item in paginatedResult" :key="item.key">
                    <TagView
                        v-if="item.type === 'tag'"
                        :show-image="settingsStore.showImage"
                        :meta="(item as SearchResultTag).data"
                        show-category />
                    <EmbeddingView
                        v-if="item.type === 'embedding'"
                        :show-image="settingsStore.showImage"
                        :data="(item as SearchResultEmbedding).data"
                        show-category />
                    <HypernetworkView
                        v-if="item.type === 'hypernetwork'"
                        :show-image="settingsStore.showImage"
                        :data="(item as SearchResultHypernetwork).data"
                        show-category />
                </template>
            </Masonry>
        </ClientOnly>
    </ElScrollbar>
</template>

<style scoped>
.search-header {
    margin-bottom: 12px;
}
.search-title-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
}
.search-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
}
.search-count {
    font-size: 0.875rem;
    color: var(--el-text-color-secondary);
}
.search-category-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}
.category-pill {
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.8125rem;
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    border: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    outline: none;
    user-select: none;
}
.category-pill:hover {
    background-color: var(--el-fill-color);
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-7);
}
.category-pill.active {
    background-color: var(--el-color-primary);
    color: #fff;
    border-color: var(--el-color-primary);
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.35);
}
.scrollable {
    height: calc(100vh - 64px - 20px - 10px - 1.17rem - 6.5rem);
    overflow-y: auto;
}
</style>
