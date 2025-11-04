<template>
<section class="space-y-6">
    <!-- Header (centered title + button) -->
  <div class="flex items-center justify-center gap-3">
    <h1 class="text-2xl font-bold text-red-700">Share Anything</h1>
    <button
      v-if="isAuthenticated"
      @click="showComposer = true"
      class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
      aria-label="Create a new thought"
    >
      New Thought
    </button>
  </div>
  <!-- 2-column responsive layout (sidebar + feed) -->
  <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Left: Communities (1/5 ≈ 2/12) -->
      <aside
        class="md:col-span-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4
               md:sticky md:top-20 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto"
        aria-label="Communities sidebar"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-700 dark:text-slate-200">Communities</h2>
          <button
            v-if="isAuthenticated"
            class="text-sm px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
            aria-label="Add community"
            @click="openAddCommunity()"
          >
            + Add
          </button>
        </div>
        <ul class="space-y-1 text-sm" role="listbox" aria-label="Communities list">
    <!-- All thoughts option -->
    <li
      role="option"
      :aria-selected="activeCommunityId === null"
      tabindex="0"
      class="flex items-center gap-2 px-2 py-2 rounded cursor-pointer
             hover:bg-gray-50 dark:hover:bg-slate-700
             outline-none focus:ring-2 focus:ring-red-400"
      :class="activeCommunityId === null ? 'bg-red-50 dark:bg-slate-700/60' : ''"
      @click="selectCommunity(null)"
      @keydown.enter.prevent="selectCommunity(null)"
      @keydown.space.prevent="selectCommunity(null)"
    >
      <div class="w-6 h-6 rounded bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs">🌐</div>
      <div class="flex-1 truncate">
        <span class="font-medium text-gray-800 dark:text-slate-100 truncate">All Communities</span>
      </div>
    </li>
    
    <li
      v-for="c in communities"
      :key="c.id"
      role="option"
      :aria-selected="c.id === activeCommunityId"
      tabindex="0"
      class="flex items-center gap-2 px-2 py-2 rounded cursor-pointer
             hover:bg-gray-50 dark:hover:bg-slate-700
             outline-none focus:ring-2 focus:ring-red-400"
      :class="c.id === activeCommunityId ? 'bg-red-50 dark:bg-slate-700/60' : ''"
      @click="selectCommunity(c.id)"
      @keydown.enter.prevent="selectCommunity(c.id)"
      @keydown.space.prevent="selectCommunity(c.id)"
    >
      <img
        v-if="c.imageUrl"
        :src="c.imageUrl"
        class="w-6 h-6 rounded object-cover"
        :alt="`${c.name} logo`"
      />
      <div class="flex-1 truncate">
        <span class="font-medium text-gray-800 dark:text-slate-100 truncate">{{ c.name }}</span>
      </div>
      <button
        v-if="isAuthenticated"
        class="ml-2 text-yellow-500 hover:scale-110 transition"
        :aria-label="c.favourited ? 'Unfavourite community' : 'Favourite community'"
        @click.stop="toggleFavourite(c)"
        :title="c.favourited ? 'Unfavourite' : 'Favourite'"
      >
        {{ c.favourited ? '★' : '☆' }}
      </button>
    </li>
    <li v-if="!communities.length" class="text-gray-500 dark:text-slate-400 px-2 py-1">
      No communities yet.
    </li>
  </ul>
     </aside>
    
    <!-- Center: Thoughts feed (expanded to fill remaining width) -->
    <main class="md:col-span-10 space-y-6" aria-label="Thoughts feed">

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 4" :key="n" class="animate-pulse bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-full bg-gray-200 dark:bg-slate-700"></div>
          <div class="h-3 w-40 rounded bg-gray-200 dark:bg-slate-700"></div>
        </div>
        <div class="mt-4 h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-700"></div>
        <div class="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-slate-700"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!thoughts.length" class="text-center py-16 border border-dashed rounded-2xl dark:border-slate-700">
      <p class="text-gray-500 dark:text-slate-400">No thoughts yet. Be the first to share!</p>
    </div>

        <!-- Composer Modal (existing) -->
    <div v-if="showComposer" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-xl">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Create Thought</h2>
        <div class="space-y-3">
        <!-- Title -->
        <input
          v-model="form.title"
          @blur="touched.title = true"
          placeholder="Title"
          class="w-full p-3 rounded-lg border dark:bg-slate-700 dark:text-white"
          :class="{
            'border-red-500 focus:ring-red-500': touched.title && !form.title?.trim()
          }"
        />
        <p v-if="touched.title && !form.title?.trim()" class="text-xs text-red-600 mt-1">
          Title is required.
        </p>

        <!-- Body -->
        <textarea
          v-model="form.body"
          @blur="touched.body = true"
          placeholder="What’s on your mind?"
          class="w-full p-3 rounded-lg border h-28 dark:bg-slate-700 dark:text-white"
          :class="{
            'border-red-500 focus:ring-red-500': touched.body && !form.body?.trim()
          }"
        ></textarea>
        <p v-if="touched.body && !form.body?.trim()" class="text-xs text-red-600 mt-1">
          Description is required.
        </p>

        <!-- Image URL (optional) -->
        <input
          v-model="form.imageUrl"
          placeholder="Image URL (optional)"
          class="w-full p-3 rounded-lg border dark:bg-slate-700 dark:text-white"
        />
        </div>
        <div class="mt-4 flex gap-2 justify-end">
          <button @click="showComposer = false" class="px-3 py-2 rounded-lg border">Cancel</button>
          <button
            @click="createThought"
            :disabled="!isValid || submitting"
            class="px-4 py-2 rounded-lg font-semibold text-white transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-red-600 hover:bg-red-700"
          >
            {{ submitting ? 'Posting…' : 'Post' }}
          </button>
        </div>
      </div>
    </div>


    <!-- Add Community Modal -->
    <div v-if="showAddCommunity" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Add Community</h2>
        <div class="space-y-3">
          <input
            v-model="communityForm.name"
            @blur="communityTouched.name = true"
            placeholder="Community name"
            class="w-full p-3 rounded-lg border dark:bg-slate-700 dark:text-white"
            :class="{'border-red-500': communityTouched.name && !communityForm.name?.trim()}"
            aria-label="Community name"
          />
          <textarea
            v-model="communityForm.description"
            placeholder="Description (optional)"
            class="w-full p-3 rounded-lg border h-24 dark:bg-slate-700 dark:text-white"
            aria-label="Community description"
          ></textarea>
          <input
            v-model="communityForm.imageUrl"
            placeholder="Logo URL (optional)"
            class="w-full p-3 rounded-lg border dark:bg-slate-700 dark:text-white"
            aria-label="Community logo URL"
          />
          <p v-if="communityTouched.name && !communityForm.name?.trim()" class="text-xs text-red-600">
            Name is required.
          </p>
        </div>
        <div class="mt-4 flex gap-2 justify-end">
          <button @click="closeAddCommunity()" class="px-3 py-2 rounded-lg border">Cancel</button>
          <button
            @click="submitAddCommunity"
            :disabled="!communityForm.name?.trim() || addingCommunity"
            class="px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {{ addingCommunity ? 'Saving…' : 'Create' }}
          </button>
        </div>
      </div>
    </div>


    <!-- One column feed -->
    <div v-else class="grid grid-cols-1 gap-6">
    <article
      v-for="t in thoughts"
      :key="t.id"
      class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm"
    >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Avatar (first letter) -->
          <div class="h-9 w-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-semibold">
            {{ (t.authorName || t.authorEmail || 'A').charAt(0).toUpperCase() }}
          </div>
          <div class="text-sm">
            <div class="font-medium text-gray-900 dark:text-white">
              {{ t.authorName || t.authorEmail || 'Anonymous' }}
            </div>
            <div class="text-gray-500 dark:text-slate-400">{{ formatDate(t.createdAt) }}</div>
          </div>
        </div>
        <span class="text-xs px-2 py-1 rounded bg-red-50 text-red-700">Thought</span>
      </div>

      <!-- Content -->
      <router-link
        :to="`/community/${t.id}`"
        class="block mt-3 group focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
        aria-label="Open thought"
      >
        <h2 class="font-bold text-lg text-gray-900 dark:text-white group-hover:underline">
          {{ t.title }}
        </h2>
        <p class="mt-2 text-gray-700 dark:text-slate-300">
          {{ t.body }}
        </p>
        <img
          v-if="t.imageUrl"
          :src="t.imageUrl"
          alt=""
          class="mt-3 rounded-xl w-full object-cover max-h-64"
          loading="lazy"
        />
      </router-link>

      <!-- Actions -->
      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Upvote -->
          <button
            :disabled="t.voteBusy"
            @click="onVoteFeed(t, 1)"
            class="px-3 py-1 rounded-lg border"
            :class="{
              'bg-red-600 text-white border-red-600': (t.userVote || 0) === 1,
              'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600': (t.userVote || 0) !== 1
            }"
            aria-label="Upvote"
            title="Upvote"
          >▲</button>

          <!-- score -->
          <span class="min-w-[2ch] text-center font-semibold">
            {{ (t.upvotes || 0) - (t.downvotes || 0) }}
          </span>

          <!-- Downvote -->
          <button
            :disabled="t.voteBusy"
            @click="onVoteFeed(t, -1)"
            class="px-3 py-1 rounded-lg border"
            :class="{
              'bg-slate-700 text-white border-slate-700': (t.userVote || 0) === -1,
              'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600': (t.userVote || 0) !== -1
            }"
            aria-label="Downvote"
            title="Downvote"
          >▼</button>
        </div>

        <div class="flex items-center gap-3">
          <router-link :to="`/community/${t.id}`" class="text-red-600 hover:underline">
            {{ t.commentsCount || 0 }} comments →
          </router-link>
          <button @click="share(t)" class="text-gray-500 hover:text-gray-700" aria-label="Share">↗︎ Share</button>
        </div>
      </div>
    </article>
    </div>

    <div class="text-center" v-if="nextCursor">
          <button @click="loadMore" class="mt-4 px-5 py-2 rounded-lg border font-medium">
            Load more
          </button>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchThoughts, createThoughtApi, voteThought, fetchCommunities, createCommunityApi, toggleCommunityFavourite } from '@/utils/api'; 
import { isAuthenticated as checkAuth } from '@/utils/api';

const thoughts = ref([]);
const nextCursor = ref(null);
const showComposer = ref(false);
const isAuthenticated = checkAuth();
const activeCommunityId = ref(null);
const loading = ref(true);

const form = ref({ title: '', body: '', imageUrl: '' });

// Communities state
const communities = ref([]);
const showAddCommunity = ref(false);
const communityForm = ref({ name: '', description: '', imageUrl: '' });
const communityTouched = ref({ name: false });
const addingCommunity = ref(false);

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return '' }
}

const touched = ref({ title: false, body: false });
const submitting = ref(false);

const isValid = computed(() => {
  return !!form.value.title?.trim() && !!form.value.body?.trim();
});

async function loadPage(cursor = null) {
  const { items, nextCursor: nxt } = await fetchThoughts({ limit: 12, cursor, communityId: activeCommunityId.value || undefined });
  // Ensure UI-safe defaults (so vote buttons can highlight)
  for (const t of items) {
    t.userVote = t.userVote ?? 0;
    t.upvotes = t.upvotes ?? 0;
    t.downvotes = t.downvotes ?? 0;
    t.voteBusy = false;
  }
  if (!cursor) thoughts.value = items; else thoughts.value.push(...items);
  nextCursor.value = nxt;
}

async function loadMore() {
  if (nextCursor.value) await loadPage(nextCursor.value);
}

async function createThought() {
  // mark as touched so the red borders + messages appear if empty
  touched.value.title = true;
  touched.value.body = true;

  if (!isValid.value) return;

  try {
    submitting.value = true;
    const payload = {
      title: form.value.title.trim(),
      body: form.value.body.trim(),
      imageUrl: form.value.imageUrl?.trim() || '',
      communityId: activeCommunityId.value || undefined
    };

    const t = await createThoughtApi(payload);
    thoughts.value.unshift(t);

    // reset & close
    form.value = { title: '', body: '', imageUrl: '' };
    touched.value = { title: false, body: false };
    showComposer.value = false;
  } catch (err) {
    console.error('createThought failed:', err?.response?.data || err?.message || err);
    // Optional: show a small, inline toast. If you don't have a toast lib,
    // you can add a small error text near the buttons similarly to the field errors.
  } finally {
    submitting.value = false;
  }
}

async function doVote(t, value) {
  try {
    await voteThought(t.id, value);
    if (value === 1) {
      t.upvotes = (t.upvotes || 0) + 1;
      if ((t.__lastVote || 0) === -1) t.downvotes = Math.max(0, (t.downvotes || 0) - 1);
      t.__lastVote = 1;
    } else {
      t.downvotes = (t.downvotes || 0) + 1;
      if ((t.__lastVote || 0) === 1) t.upvotes = Math.max(0, (t.upvotes || 0) - 1);
      t.__lastVote = -1;
    }
  } catch { /* toast error if you have one */ }
}

function applyOptimistic(th, nextValue) {
  // remove previous contribution
  if ((th.userVote || 0) === 1) th.upvotes = Math.max(0, (th.upvotes || 0) - 1);
  if ((th.userVote || 0) === -1) th.downvotes = Math.max(0, (th.downvotes || 0) - 1);
  // apply new contribution
  if (nextValue === 1) th.upvotes = (th.upvotes || 0) + 1;
  if (nextValue === -1) th.downvotes = (th.downvotes || 0) + 1;
  th.userVote = nextValue;
}

async function onVoteFeed(th, clickValue) {
  if (th.voteBusy) return;
  th.voteBusy = true;
  const current = th.userVote || 0;
  const next = current === clickValue ? 0 : clickValue; // toggle → unvote
  const prev = { up: th.upvotes || 0, down: th.downvotes || 0, userVote: current };
  applyOptimistic(th, next);
  try {
    const resp = await voteThought(th.id, next);
    if (resp?.upvotes != null) th.upvotes = resp.upvotes;
    if (resp?.downvotes != null) th.downvotes = resp.downvotes;
    if (resp?.userVote != null) th.userVote = resp.userVote;
  } catch (e) {
    // rollback
    th.upvotes = prev.up;
    th.downvotes = prev.down;
    th.userVote = prev.userVote;
    console.error('vote failed', e);
  } finally {
    th.voteBusy = false;
  }
}

function share(t) {
  const url = `${window.location.origin}/community/${t.id}`;
  if (navigator.share) {
    navigator.share({ title: t.title || 'Thought', text: t.body?.slice(0, 100) || 'Check this out', url }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(url);
  }
}


//side bar community functions
async function loadCommunities() {
  try {
    const data = await fetchCommunities();
    communities.value = data.items || [];
    // Don't auto-select or filter - show all thoughts initially
  } catch (e) {
    console.error('fetchCommunities failed', e);
  }
}

async function selectCommunity(id) {
  if (activeCommunityId.value === id) return;
  activeCommunityId.value = id;
  await loadPage(null);
}

async function toggleFavourite(c) {
  // optimistic toggle
  const prev = !!c.favourited;
  c.favourited = !prev;
  try {
    await toggleCommunityFavourite(c.id, c.favourited);
  } catch (e) {
    c.favourited = prev; // rollback
    console.error('toggle favourite failed', e);
  }
}

function openAddCommunity() {
  communityTouched.value = { name: false };
  communityForm.value = { name: '', description: '', imageUrl: '' };
  showAddCommunity.value = true;
}
function closeAddCommunity() {
  showAddCommunity.value = false;
}
async function submitAddCommunity() {
  communityTouched.value.name = true;
  if (!communityForm.value.name?.trim()) return;
  try {
    addingCommunity.value = true;
    const created = await createCommunityApi({
      name: communityForm.value.name.trim(),
      description: communityForm.value.description?.trim() || '',
      imageUrl: communityForm.value.imageUrl?.trim() || '',
    });
    // prepend and select it
    communities.value.unshift({ ...created, favourited: true });
    activeCommunityId.value = created.id;
    showAddCommunity.value = false;
    await loadPage(null);
  } catch (e) {
    console.error('create community failed', e);
  } finally {
    addingCommunity.value = false;
  }
}


onMounted(async () => {
  try {
    await loadCommunities();
    // Always load thoughts (no filter initially, shows all)
    await loadPage();
  } finally {
    loading.value = false;
  }
});


</script>
