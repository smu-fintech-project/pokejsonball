<template>
  <section class="space-y-6">
    <router-link to="/community" class="text-sm text-gray-500 hover:underline">← Back to Community</router-link>

    <article v-if="thought" class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-slate-400">
          {{ thought.authorName || thought.authorEmail || 'Anonymous' }} · {{ formatDate(thought.createdAt) }}
        </div>
        <div class="flex items-center gap-2">
          <button @click="vote(1)" class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-700">👍 {{ thought.upvotes || 0 }}</button>
          <button @click="vote(-1)" class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-700">👎 {{ thought.downvotes || 0 }}</button>
        </div>
      </div>

      <h1 class="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{{ thought.title }}</h1>
      <p class="mt-3 text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{{ thought.body }}</p>
      <img v-if="thought.imageUrl" :src="thought.imageUrl" class="mt-4 rounded-xl w-full object-cover max-h-96">
    </article>

    <!-- Add comment -->
    <div v-if="isAuthenticated" class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
      <h3 class="font-semibold mb-2">Add a comment</h3>
      <textarea v-model="newComment" class="w-full p-3 rounded-lg border dark:bg-slate-700 dark:text-white" rows="4"
        placeholder="Be kind. Share helpful insights or questions."></textarea>
      <div class="mt-3 flex justify-end">
        <button @click="submitComment" class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
          Comment
        </button>
      </div>
    </div>

    <!-- Comments -->
    <div class="space-y-4">
      <div v-for="c in comments" :key="c.id" class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700">
        <div class="text-sm text-gray-500 dark:text-slate-400">
          {{ c.authorName || c.authorEmail || 'Anonymous' }} · {{ formatDate(c.createdAt) }}
        </div>
        <p class="mt-2 text-gray-800 dark:text-slate-200 whitespace-pre-wrap">{{ c.body }}</p>
        <div class="mt-3 flex items-center gap-2">
          <button @click="voteComment(c, 1)" class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-700">👍 {{ c.upvotes || 0 }}</button>
          <button @click="voteComment(c, -1)" class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-700">👎 {{ c.downvotes || 0 }}</button>
          <button @click="shareComment(c)" class="text-gray-500 hover:text-gray-700 ml-auto">↗︎ Share</button>
        </div>
      </div>
    </div>

    <div class="text-center" v-if="nextCursor">
      <button @click="loadMore" class="mt-2 px-5 py-2 rounded-lg border font-medium">Load more</button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  fetchThought, fetchComments, addCommentApi, voteThought, voteComment as voteCommentApi
} from '@/utils/api';
import { isAuthenticated as checkAuth } from '@/utils/api';

const route = useRoute();
const thoughtId = route.params.id;

const thought = ref(null);
const comments = ref([]);
const nextCursor = ref(null);
const newComment = ref('');
const isAuthenticated = checkAuth();

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return '' }
}

async function loadThought() {
  thought.value = await fetchThought(thoughtId);
}

async function loadComments(cursor = null) {
  const { items, nextCursor: nxt } = await fetchComments(thoughtId, { limit: 20, cursor });
  if (!cursor) comments.value = items; else comments.value.push(...items);
  nextCursor.value = nxt;
}

async function loadMore() {
  if (nextCursor.value) await loadComments(nextCursor.value);
}

async function submitComment() {
  if (!newComment.value.trim()) return;
  const c = await addCommentApi(thoughtId, { body: newComment.value.trim() });
  comments.value.push(c);
  newComment.value = '';
  thought.value.commentsCount = (thought.value.commentsCount || 0) + 1;
}

async function vote(value) {
  await voteThought(thoughtId, value);
  if (value === 1) {
    thought.value.upvotes = (thought.value.upvotes || 0) + 1;
  } else {
    thought.value.downvotes = (thought.value.downvotes || 0) + 1;
  }
}

async function voteComment(c, value) {
  await voteCommentApi(thoughtId, c.id, value);
  if (value === 1) {
    c.upvotes = (c.upvotes || 0) + 1;
  } else {
    c.downvotes = (c.downvotes || 0) + 1;
  }
}

function shareComment(c) {
  const url = `${window.location.origin}/community/${thoughtId}#${c.id}`;
  navigator.clipboard.writeText(url);
}

onMounted(async () => {
  await loadThought();
  await loadComments();
});
</script>
