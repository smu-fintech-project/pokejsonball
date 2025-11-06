<template>
  <section class="space-y-4 px-5">
    <!-- Improved back button -->
    <router-link 
      to="/community" 
      class="inline-flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
    >
      <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span class="font-medium">Back to Community</span>
    </router-link>

    <article v-if="thought" class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 px-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Avatar image (fallback to initial) -->
          <div class="h-10 w-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-semibold overflow-hidden">
            <img
              v-if="avatarSrcFor(thought)"
              :src="avatarSrcFor(thought)"
              alt=""
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <span v-else>
              {{ getDisplayName(thought.authorName, thought.authorEmail).charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="text-sm">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900 dark:text-white">
                {{ getDisplayName(thought.authorName, thought.authorEmail) }}
              </span>
              <span v-if="communityName" class="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {{ communityName }}
              </span>
            </div>
            <div class="text-gray-500 dark:text-slate-400">{{ formatDate(thought.createdAt) }}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
            <!-- Upvote -->
            <button
                :disabled="voteBusy"
                @click="onVoteThought(thought, 1)"
                class="px-3 py-1 rounded-lg border"
                :class="{
                'bg-red-600 text-white border-red-600': (thought.userVote || 0) === 1,
                'text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600': (thought.userVote || 0) !== 1
                }"
                title="Upvote"
            >
                ▲
            </button>

            <!-- score (up - down) -->
            <span class="min-w-[2ch] text-center font-semibold">
                {{ (thought.upvotes || 0) - (thought.downvotes || 0) }}
            </span>

            <!-- Downvote -->
            <button
                :disabled="voteBusy"
                @click="onVoteThought(thought, -1)"
                class="px-3 py-1 rounded-lg border"
                :class="{
                'bg-slate-700 text-white border-slate-700': (thought.userVote || 0) === -1,
                'text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600': (thought.userVote || 0) !== -1
                }"
                title="Downvote"
            >
                ▼
            </button>
        </div>
      </div>

      <h1 class="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{{ thought.title }}</h1>
      <p class="mt-3 text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{{ thought.body }}</p>
      
      <!-- Video -->
      <video
        v-if="thought.imageUrl && isVideo(thought.imageUrl)"
        :src="thought.imageUrl"
        controls
        class="mt-4 rounded-xl w-full max-h-[32rem] object-contain bg-black"
        loading="lazy"
      ></video>
      
      <!-- Single Image or Carousel -->
      <div v-else-if="thought.imageUrl" class="mt-4 relative">
        <img
          :src="Array.isArray(thought.imageUrl) ? thought.imageUrl[thought.currentSlide] : thought.imageUrl"
          class="rounded-xl w-full max-h-[32rem] object-contain bg-gray-50 dark:bg-slate-900"
          loading="lazy"
          alt="Thought media"
        />
        
        <!-- Carousel controls (only show if multiple images) -->
        <template v-if="Array.isArray(thought.imageUrl) && thought.imageUrl.length > 1">
          <!-- Left arrow -->
          <button
            @click.stop="thought.currentSlide = (thought.currentSlide - 1 + thought.imageUrl.length) % thought.imageUrl.length"
            class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"
            aria-label="Previous image"
          >
            ‹
          </button>
          
          <!-- Right arrow -->
          <button
            @click.stop="thought.currentSlide = (thought.currentSlide + 1) % thought.imageUrl.length"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"
            aria-label="Next image"
          >
            ›
          </button>
          
          <!-- Slide indicators -->
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              v-for="(_, idx) in thought.imageUrl"
              :key="idx"
              @click.stop="thought.currentSlide = idx"
              class="w-2 h-2 rounded-full transition-all"
              :class="thought.currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'"
              :aria-label="`Go to slide ${idx + 1}`"
            ></button>
          </div>
        </template>
      </div>
    </article>

   

    <!-- Comments -->
    <div class="space-y-4 px-6">
      <div v-for="c in comments" :key="c.id" class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700">
        <div class="flex items-center gap-3 mb-3">
          <!-- Avatar image (fallback to initial) -->
          <div class="h-8 w-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-semibold text-sm overflow-hidden">
            <img
              v-if="avatarSrcFor(c)"
              :src="avatarSrcFor(c)"
              alt=""
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <span v-else>
              {{ getDisplayName(c.authorName, c.authorEmail).charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="text-sm">
            <div class="font-medium text-gray-900 dark:text-white">
              {{ getDisplayName(c.authorName, c.authorEmail) }}
            </div>
            <div class="text-gray-500 dark:text-slate-400">{{ formatDate(c.createdAt) }}</div>
          </div>
        </div>
        <p class="mt-2 text-gray-800 dark:text-slate-200 whitespace-pre-wrap">{{ c.body }}</p>
        <div class="mt-3 flex items-center gap-2">
        <!-- Upvote -->
        <button
            :disabled="c.voteBusy"
            @click="onVoteComment(c, 1)"
            class="px-2 py-1 rounded border"
            :class="{
            'bg-red-600 text-white border-red-600': (c.userVote || 0) === 1,
            'text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600': (c.userVote || 0) !== 1
            }"
            title="Upvote"
        >▲</button>

        <!-- score -->
        <span class="min-w-[2ch] text-center font-semibold">
            {{ (c.upvotes || 0) - (c.downvotes || 0) }}
        </span>

        <!-- Downvote -->
        <button
                :disabled="c.voteBusy"
                @click="onVoteComment(c, -1)"
                class="px-2 py-1 rounded border"
                :class="{
                'bg-slate-700 text-white border-slate-700': (c.userVote || 0) === -1,
                'text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600': (c.userVote || 0) !== -1
                }"
                title="Downvote"
            >▼</button>

            <button @click="shareComment(c)" class="text-gray-500 hover:text-gray-700 ml-auto">↗︎ Share</button>
            </div>

      </div>
    </div>

    <div class="text-center" v-if="nextCursor">
      <button @click="loadMore" class="mt-2 px-5 py-2 rounded-lg border font-medium">Load more</button>
    </div>

     <!-- Add comment -->
    <div 
    v-if="isAuthenticated" 
    class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-2 border-red-200 dark:border-red-900 p-6 space-y-4"
>
    <h3 class="text-xl font-black text-gray-900 dark:text-white">Add a comment</h3>
    
    <textarea 
        v-model="newComment" 
        class="w-full p-4 rounded-xl border-2 border-red-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white transition-all focus:ring-4 focus:ring-red-300 focus:border-red-500 resize-none" 
        rows="4"
        placeholder="Be kind. Share helpful insights or questions."
    ></textarea>
    
    <div class="flex justify-end">
        <button 
            @click="submitComment" 
            :disabled="!newComment.trim()"
            class="px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg 
                  bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 
                  border-b-4 border-red-800 active:border-b-2 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Comment
        </button>
    </div>
</div>
  </section>

  
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  fetchThought, fetchComments, addCommentApi, voteThought, voteComment as voteCommentApi, fetchCommunities
} from '@/utils/api';
import { isAuthenticated as checkAuth } from '@/utils/api';
import { API_BASE } from '@/utils/env';

const route = useRoute();
const thoughtId = route.params.id;

const thought = ref(null);
const comments = ref([]);
const nextCursor = ref(null);
const newComment = ref('');
const isAuthenticated = checkAuth();
const communityName = ref(null);

// Helper: Extract username from email or use name
function getDisplayName(authorName, authorEmail) {
  if (authorName.trim().includes('@')){
    return authorName.split('@')[0][0].toUpperCase() + authorName.split('@')[0].slice(1);
  }else if(!authorName.trim().includes('@')) {
    return authorName
  }else{
  return 'Anonymous';
}
}

// Helper: Format as relative time
function formatDate(iso) {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return diffSec <= 1 ? 'just now' : `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
    
    const diffYear = Math.floor(diffDay / 365);
    return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`;
  } catch {
    return '';
  }
}

// Get avatar image URL
function avatarSrcFor(item) {
  if (!item?.authorAvatar) return null;
  return `${API_BASE}/api/cards/images/avatar/${item.authorAvatar}`;
}

// Check if URL is video
function isVideo(url) {
  if (!url) return false;
  // If it's an array, it's multiple images (not a video)
  if (Array.isArray(url)) return false;
  // Must be a string to check extension
  if (typeof url !== 'string') return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.gif'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
}

async function loadThought() {
  const t = await fetchThought(thoughtId);
  // Ensure defaults for UI
  t.userVote = t.userVote ?? 0;
  t.upvotes = t.upvotes ?? 0;
  t.downvotes = t.downvotes ?? 0;
  t.currentSlide = 0; // Initialize carousel slide
  thought.value = t;
  
  // Load community name if thought belongs to one
  if (t.communityId) {
    try {
      const communitiesData = await fetchCommunities();
      const community = communitiesData.items?.find(c => c.id === t.communityId);
      communityName.value = community?.name || null;
    } catch (e) {
      console.error('Failed to load community', e);
    }
  }
}

async function loadComments(cursor = null) {
  const { items, nextCursor: nxt } = await fetchComments(thoughtId, { limit: 20, cursor });
  for (const c of items) {
    c.userVote = c.userVote ?? 0;
    c.upvotes = c.upvotes ?? 0;
    c.downvotes = c.downvotes ?? 0;
    c.voteBusy = false;
  }
  if (!cursor) comments.value = items; else comments.value.push(...items);
  nextCursor.value = nxt;
}

async function loadMore() {
  if (nextCursor.value) await loadComments(nextCursor.value);
}

async function submitComment() {
  if (!newComment.value.trim()) return;
  const c = await addCommentApi(thoughtId, { body: newComment.value.trim() });
  comments.value.unshift(c); 
  newComment.value = '';
  thought.value.commentsCount = (thought.value.commentsCount || 0) + 1;
}

async function onVoteThought(th, clickValue) {
  if (voteBusy.value) return;
  voteBusy.value = true;

  const current = th.userVote || 0;
  // toggle: click again => unvote (0)
  const next = current === clickValue ? 0 : clickValue;

  // optimistic UI
  const prev = { up: th.upvotes || 0, down: th.downvotes || 0, userVote: current };
  applyOptimistic(th, next);

  try {
    // backend should accept { value: -1|0|1 } and ideally return { upvotes, downvotes, userVote }
    const resp = await voteThought(thoughtId, next);
    if (resp?.upvotes != null) th.upvotes = resp.upvotes;
    if (resp?.downvotes != null) th.downvotes = resp.downvotes;
    if (resp?.userVote != null) th.userVote = resp.userVote;
  } catch (e) {
    // rollback on error
    th.upvotes = prev.up;
    th.downvotes = prev.down;
    th.userVote = prev.userVote;
    console.error('vote failed', e);
  } finally {
    voteBusy.value = false;
  }
}


async function onVoteComment(c, clickValue) {
  if (c.voteBusy) return;
  c.voteBusy = true;

  const current = c.userVote || 0;
  const next = current === clickValue ? 0 : clickValue;

  const prev = { up: c.upvotes || 0, down: c.downvotes || 0, userVote: current };
  applyOptimisticComment(c, next);

  try {
    const resp = await voteCommentApi(thoughtId, c.id, next);
    if (resp?.upvotes != null) c.upvotes = resp.upvotes;
    if (resp?.downvotes != null) c.downvotes = resp.downvotes;
    if (resp?.userVote != null) c.userVote = resp.userVote;
  } catch (e) {
    c.upvotes = prev.up;
    c.downvotes = prev.down;
    c.userVote = prev.userVote;
    console.error('comment vote failed', e);
  } finally {
    c.voteBusy = false;
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


const voteBusy = ref(false);

function applyOptimistic(th, nextValue) {
  // remove previous contribution
  if ((th.userVote || 0) === 1) th.upvotes = Math.max(0, (th.upvotes || 0) - 1);
  if ((th.userVote || 0) === -1) th.downvotes = Math.max(0, (th.downvotes || 0) - 1);

  // apply new contribution
  if (nextValue === 1) th.upvotes = (th.upvotes || 0) + 1;
  if (nextValue === -1) th.downvotes = (th.downvotes || 0) + 1;

  th.userVote = nextValue;
}

function applyOptimisticComment(c, nextValue) {
  if ((c.userVote || 0) === 1) c.upvotes = Math.max(0, (c.upvotes || 0) - 1);
  if ((c.userVote || 0) === -1) c.downvotes = Math.max(0, (c.downvotes || 0) - 1);

  if (nextValue === 1) c.upvotes = (c.upvotes || 0) + 1;
  if (nextValue === -1) c.downvotes = (c.downvotes || 0) + 1;

  c.userVote = nextValue;
}

</script>
