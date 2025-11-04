<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-red-700">Community</h1>
      <button
        v-if="isAuthenticated"
        @click="showComposer = true"
        class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
      >New Thought</button>
    </div>

    <!-- Composer Modal -->
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

    <!-- Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <article v-for="t in thoughts" :key="t.id"
        class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-gray-500 dark:text-slate-400">
              {{ t.authorName || t.authorEmail || 'Anonymous' }} ·
              <span>{{ formatDate(t.createdAt) }}</span>
            </div>
          <span class="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Thought</span>
        </div>

        <h2 class="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">{{ t.title }}</h2>
        <p class="mt-2 text-gray-700 dark:text-slate-300 line-clamp-3">{{ t.body }}</p>

        <img v-if="t.imageUrl" :src="t.imageUrl" alt="" class="mt-3 rounded-xl w-full object-cover max-h-48">

        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="doVote(t, 1)" class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-700">
              👍 {{ t.upvotes || 0 }}
            </button>
            <button @click="doVote(t, -1)" class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-700">
              👎 {{ t.downvotes || 0 }}
            </button>
          </div>
          <div class="flex items-center gap-3">
            <router-link :to="`/community/${t.id}`" class="text-red-600 hover:underline">
              {{ t.commentsCount || 0 }} comments →
            </router-link>
            <button @click="share(t)" class="text-gray-500 hover:text-gray-700">↗︎ Share</button>
          </div>
        </div>
      </article>
    </div>

    <div class="text-center" v-if="nextCursor">
      <button @click="loadMore" class="mt-4 px-5 py-2 rounded-lg border font-medium">
        Load more
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchThoughts, createThoughtApi, voteThought } from '@/utils/api'; 
import { isAuthenticated as checkAuth } from '@/utils/api';

const thoughts = ref([]);
const nextCursor = ref(null);
const showComposer = ref(false);
const isAuthenticated = checkAuth();

const form = ref({ title: '', body: '', imageUrl: '' });

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return '' }
}

const touched = ref({ title: false, body: false });
const submitting = ref(false);

const isValid = computed(() => {
  return !!form.value.title?.trim() && !!form.value.body?.trim();
});

async function loadPage(cursor = null) {
  const { items, nextCursor: nxt } = await fetchThoughts({ limit: 12, cursor });
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
      imageUrl: form.value.imageUrl?.trim() || ''
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

function share(t) {
  const url = `${window.location.origin}/community/${t.id}`;
  navigator.clipboard.writeText(url);
  // optionally show a toast
}



onMounted(() => loadPage());
</script>
