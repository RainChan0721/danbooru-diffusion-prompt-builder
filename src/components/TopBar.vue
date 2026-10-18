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
import { ref, computed, watch } from 'vue'
import { ElButton, ElInput, ElSelect, ElOption } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faBars,
    faCartShopping,
    faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import { Search as IconSearch } from '@element-plus/icons-vue'
import ExtLinks from './ExtLinks.vue'
import FeatureSwitches from './FeatureSwitches.vue'

const props = withDefaults(defineProps<{
    search: string
    searchCategory?: string
}>(), {
    searchCategory: '',
})
const emit = defineEmits(['update:search', 'update:searchCategory', 'expandCategory', 'expandCart'])
const mobileExpandSearch = ref(false)

const inputVal = ref(props.search)
const selectedCategory = ref(props.searchCategory)
let debounceTimer: any = null

watch(() => props.search, (newVal) => {
    if (newVal !== inputVal.value) {
        inputVal.value = newVal
    }
})

watch(() => props.searchCategory, (newVal) => {
    if (newVal !== selectedCategory.value) {
        selectedCategory.value = newVal
    }
})

function onInput(val: string) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        emit('update:search', val)
    }, 150)
}

function onCategoryChange(val: string) {
    emit('update:searchCategory', val)
}

function onClear() {
    if (debounceTimer) clearTimeout(debounceTimer)
    emit('update:search', '')
}
</script>

<template>
    <div :class="['topbar', { 'is-search-expanded': mobileExpandSearch }]">
        <div class="left">
            <ElButton
                size="large"
                text
                class="category-cascader"
                @click="emit('expandCategory')">
                <FontAwesomeIcon :icon="faBars" />
            </ElButton>
            <span class="app-title text-large font-600 mr-3">
                Danbooru 标签超市
            </span>
        </div>
        <div class="right split">
            <ElInput
                v-model="inputVal"
                :prefix-icon="IconSearch"
                class="search"
                placeholder="搜索标签、中文名、别名、画师..."
                clearable
                @input="onInput"
                @clear="onClear">
                <template #prepend>
                    <ElSelect
                        v-model="selectedCategory"
                        placeholder="全部分类"
                        class="category-select"
                        style="width: 110px"
                        @change="onCategoryChange">
                        <ElOption label="全部分类" value="" />
                        <ElOption label="🔞 限制级" value="限制级" />
                        <ElOption label="动作姿态" value="姿势" />
                        <ElOption label="服饰装扮" value="服饰" />
                        <ElOption label="身体部位" value="人类" />
                        <ElOption label="物品道具" value="物品" />
                        <ElOption label="自然环境" value="自然" />
                        <ElOption label="人文建筑" value="人文" />
                        <ElOption label="角色" value="角色" />
                        <ElOption label="作品版权" value="作品" />
                        <ElOption label="热门画师" value="画师" />
                        <ElOption label="负向/质量" value="元标签" />
                    </ElSelect>
                </template>
            </ElInput>
            <div class="mobile-topbar-orig-el">
                <FeatureSwitches class="switches" />
                <ExtLinks class="extlinks" />
            </div>
            <ElButton
                size="large"
                text
                class="search-cascader"
                @click="mobileExpandSearch = !mobileExpandSearch">
                <FontAwesomeIcon :icon="faMagnifyingGlass" />
            </ElButton>
            <ElButton
                size="large"
                text
                class="cart-cascader"
                @click="emit('expandCart')">
                <FontAwesomeIcon :icon="faCartShopping" />
            </ElButton>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    line-height: 18px;

    .left {
        display: flex;
        align-items: center;
        gap: 2rem;
        font-size: 18px;
        color: var(--el-text-color-primary);
    }
    .right {
        display: flex;
        gap: 2rem;
        align-items: center;
    }
}

.search {
    max-width: 28rem;
    min-width: 14rem;
}

@media (max-width: 768px) {
    .topbar {
        .left {
            gap: 0.5rem;
            width: 100%;
            transition: 1s all;
        }
        .right {
            justify-content: flex-end;
            gap: 0.5rem;
        }
        .search {
            display: none;
        }

        &.is-search-expanded {
            .left {
                width: unset;
            }
            .right {
                width: 100%;
                flex-grow: 1;
            }
            .app-title {
                display: none;
            }
            .search {
                display: block;
                width: 100%;
            }
        }
    }
}

.extlinks {
    margin-right: 0;
}

.switches {
    > * {
        margin-right: 1rem;
    }
}

.category-cascader,
.cart-cascader,
.search-cascader {
    padding: 12px 15px;
    margin-left: 0;
}

@media screen and (min-width: 1025px) {
    .category-cascader,
    .cart-cascader {
        display: none;
    }
}

@media screen and (min-width: 768px) {
    .search-cascader {
        display: none;
    }
}
</style>
