<template>
<section class="space-y-6">
    <!-- Header (centered button) -->
  <div class="flex items-center justify-center">
    <button
      v-if="isAuthenticated"
      @click="showComposer = true"
      class="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
      aria-label="Create a new thought"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span>Create New Thought</span>
    </button>
  </div>
  
  <!-- Collapsible sidebar toggle (mobile/tablet) -->
  <button
    v-if="!sidebarOpen"
    @click="sidebarOpen = true"
    class="fixed left-4 top-24 z-40 lg:hidden bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
    aria-label="Open communities sidebar"
  >
    <svg class="w-6 h-6 text-gray-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
  
  <!-- 2-column responsive layout (sidebar + feed) -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      <!-- Backdrop overlay for mobile -->
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      ></div>
      
      <!-- Left: Communities sidebar -->
      <aside
        :class="[
          'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4',
          'transition-transform duration-300 ease-in-out',
          'lg:col-span-2 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:translate-x-0',
          'fixed top-0 left-0 h-full z-40 overflow-y-auto',
          sidebarOpen ? 'translate-x-0 w-[250px]' : '-translate-x-full w-[250px] lg:translate-x-0'
        ]"
        aria-label="Communities sidebar"
      >
        <!-- Close button for mobile -->
        <button
          @click="sidebarOpen = false"
          class="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Close sidebar"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-700 dark:text-slate-200">Communities</h2>
        </div>
        <ul class="space-y-1 text-sm mb-4" role="listbox" aria-label="Communities list">
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
      <div class="w-6 h-6 rounded bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center text-white font-bold text-xs">
        {{ c.name.charAt(0).toUpperCase() }}
      </div>
      <div class="flex-1 truncate">
        <span class="font-medium text-gray-800 dark:text-slate-100 truncate">{{ c.name }}</span>
      </div>
      <button
        v-if="isAuthenticated"
        @click.stop="toggleFavourite(c)"
        class="ml-2 hover:scale-110 transition-transform"
        :aria-label="c.favourited ? 'Unpin community' : 'Pin community'"
        :title="c.favourited ? 'Unpin from top' : 'Pin to top'"
      >
        <img 
          src="@/assets/psyduck_coin.png" 
          :class="c.favourited ? 'opacity-100' : 'opacity-30 grayscale'"
          class="w-6 h-6 transition-all"
          alt="Pin"
        />
      </button>
    </li>
    <li v-if="!communities.length" class="text-gray-500 dark:text-slate-400 px-2 py-1">
      No communities yet.
    </li>
  </ul>
  
  <!-- Add Community button at bottom -->
  <button
    v-if="isAuthenticated"
    @click="openAddCommunity()"
    class="w-full mt-auto py-2 px-3 text-sm rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
    aria-label="Add community"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    <span>Add Community</span>
  </button>
     </aside>
    
    <!-- Center: Thoughts feed (expanded to fill remaining width) -->
    <main class="lg:col-span-10 space-y-6" aria-label="Thoughts feed">

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

        <!-- Community Selector -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Post to Community <span class="text-gray-400">(optional)</span>
          </label>
          <div class="relative">
            <input
              v-model="communitySearchQuery"
              @focus="showCommunityDropdown = true"
              @input="showCommunityDropdown = true"
              @blur="handleCommunityBlur"
              type="text"
              placeholder="Search or select a community..."
              class="w-full p-3 rounded-lg border dark:bg-slate-700 dark:text-white pr-10"
            />
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            
            <!-- Dropdown -->
            <div 
              v-if="showCommunityDropdown && filteredCommunities.length > 0"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              <button
                v-for="community in filteredCommunities"
                :key="community.id"
                @mousedown.prevent="selectCommunityForThought(community)"
                class="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2 border-b border-gray-100 dark:border-slate-600 last:border-b-0"
              >
                <div class="w-6 h-6 rounded bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {{ community.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-900 dark:text-white truncate">{{ community.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-slate-400 truncate">{{ community.description || 'No description' }}</div>
                </div>
              </button>
            </div>
          </div>
          
          <!-- Selected community badge -->
          <div v-if="form.selectedCommunity" class="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
            <div class="w-5 h-5 rounded bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center text-white font-bold text-xs">
              {{ form.selectedCommunity.name.charAt(0).toUpperCase() }}
            </div>
            <span class="font-medium">{{ form.selectedCommunity.name }}</span>
            <button 
              @click="clearSelectedCommunity"
              class="hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full p-0.5"
              title="Remove community"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body with media preview -->
        <div class="relative">
          <textarea
            ref="bodyTextarea"
            v-model="form.body"
            @blur="touched.body = true"
            @paste="handlePaste"
            placeholder="What's on your mind? (You can paste images/videos here)"
            class="w-full p-3 rounded-lg border dark:bg-slate-700 dark:text-white"
            :class="{
              'border-red-500 focus:ring-red-500': touched.body && !form.body?.trim(),
              'h-28': form.mediaPreviews.length === 0,
              'h-auto min-h-[7rem]': form.mediaPreviews.length > 0
            }"
          ></textarea>
          
          <!-- Media preview - Video -->
          <div v-if="form.mediaType === 'video' && form.mediaPreviews[0]" class="mt-2 relative">
            <video :src="form.mediaPreviews[0]" controls class="w-full rounded-lg max-h-[24rem] object-contain bg-black" />
            <button
              @click="removeImage"
              class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
              title="Remove video"
            >×</button>
          </div>
          
          <!-- Media preview - Image Carousel -->
          <div v-else-if="form.mediaType === 'image' && form.mediaPreviews.length > 0" class="mt-2 relative">
            <div class="relative">
              <img :src="form.mediaPreviews[form.currentSlide]" class="w-full rounded-lg max-h-[24rem] object-contain bg-gray-50 dark:bg-slate-900" />
              
              <!-- Carousel controls -->
              <button
                v-if="form.mediaPreviews.length > 1"
                @click="form.currentSlide = (form.currentSlide - 1 + form.mediaPreviews.length) % form.mediaPreviews.length"
                class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
              >‹</button>
              
              <button
                v-if="form.mediaPreviews.length > 1"
                @click="form.currentSlide = (form.currentSlide + 1) % form.mediaPreviews.length"
                class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
              >›</button>
              
              <!-- Slide indicators -->
              <div v-if="form.mediaPreviews.length > 1" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                <div
                  v-for="(_, i) in form.mediaPreviews"
                  :key="i"
                  @click="form.currentSlide = i"
                  class="w-2 h-2 rounded-full cursor-pointer"
                  :class="i === form.currentSlide ? 'bg-white' : 'bg-white/50'"
                ></div>
              </div>
            </div>
            
            <button
              @click="removeImage"
              class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 z-10"
              title="Remove all media"
            >×</button>
          </div>
        </div>
        <p v-if="touched.body && !form.body?.trim()" class="text-xs text-red-600 mt-1">
          Description is required.
        </p>

        <!-- Upload button -->
        <div class="flex items-center gap-2">
          <input
            ref="fileInput"
            type="file"
            accept="image/*,video/*,.gif"
            @change="handleFileSelect"
            :multiple="form.mediaType !== 'video'"
            class="hidden"
          />
          <button
            @click="$refs.fileInput.click()"
            type="button"
            class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            📎 Upload Media
          </button>
          <span v-if="uploading" class="text-sm text-gray-500">Uploading...</span>
        </div>
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
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-xl">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Create New Community</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left: Form inputs -->
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Community Name</label>
              <input
                v-model="communityForm.name"
                @blur="communityTouched.name = true"
                placeholder="e.g., Pokémon TCG Collectors"
                class="w-full p-3 rounded-lg border dark:bg-slate-700 dark:text-white"
                :class="{'border-red-500': communityTouched.name && !communityForm.name?.trim()}"
                aria-label="Community name"
                maxlength="50"
              />
              <p v-if="communityTouched.name && !communityForm.name?.trim()" class="text-xs text-red-600 mt-1">
                Name is required.
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                v-model="communityForm.description"
                placeholder="What's this community about?"
                class="w-full p-3 rounded-lg border h-32 dark:bg-slate-700 dark:text-white resize-none"
                aria-label="Community description"
                maxlength="200"
              ></textarea>
              <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {{ communityForm.description?.length || 0 }}/200
              </p>
            </div>
          </div>
          
          <!-- Right: Live preview -->
          <div class="flex flex-col">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Preview</label>
            <div class="flex-1 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 bg-gray-50 dark:bg-slate-900/50">
              <div class="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700 shadow-sm">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center text-white font-bold text-sm">
                    {{ communityForm.name?.charAt(0).toUpperCase() || '?' }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {{ communityForm.name || 'Community Name' }}
                    </h3>
                  </div>
                </div>
                <p class="text-xs text-gray-600 dark:text-slate-400 line-clamp-3">
                  {{ communityForm.description || 'Your community description will appear here...' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex gap-2 justify-end">
          <button 
            @click="closeAddCommunity()" 
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submitAddCommunity"
            :disabled="!communityForm.name?.trim() || addingCommunity"
            class="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {{ addingCommunity ? 'Creating…' : 'Create Community' }}
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
          <!-- Avatar image (fallback to initial) -->
          <div class="h-9 w-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-semibold overflow-hidden">
            <img
              v-if="avatarSrcFor(t)"
              :src="avatarSrcFor(t)"
              alt=""
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <span v-else>
              {{ getDisplayName(t.authorName, t.authorEmail).charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="text-sm">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900 dark:text-white">
                {{ getDisplayName(t.authorName, t.authorEmail) }}
              </span>
              <span v-if="getCommunityName(t.communityId)" class="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {{ getCommunityName(t.communityId) }}
              </span>
            </div>
            <div class="text-gray-500 dark:text-slate-400">{{ formatDate(t.createdAt) }}</div>
          </div>
        </div>
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
        
        <!-- Video -->
        <video
          v-if="t.imageUrl && isVideo(t.imageUrl)"
          :src="t.imageUrl"
          controls
          class="mt-3 rounded-xl w-full max-h-[24rem] object-contain bg-black"
          loading="lazy"
        ></video>
        
        <!-- Single Image or Carousel -->
        <div v-else-if="t.imageUrl" class="mt-3 relative">
          <img
            :src="Array.isArray(t.imageUrl) ? t.imageUrl[t.currentSlide || 0] : t.imageUrl"
            alt="Thought media"
            class="rounded-xl w-full max-h-[24rem] object-contain bg-gray-50 dark:bg-slate-900"
            loading="lazy"
          />
          
          <!-- Carousel controls (only if imageUrl is array) -->
          <template v-if="Array.isArray(t.imageUrl) && t.imageUrl.length > 1">
            <button
              @click.prevent="t.currentSlide = ((t.currentSlide || 0) - 1 + t.imageUrl.length) % t.imageUrl.length"
              class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
            >‹</button>
            
            <button
              @click.prevent="t.currentSlide = ((t.currentSlide || 0) + 1) % t.imageUrl.length"
              class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
            >›</button>
            
            <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              <div
                v-for="(_, i) in t.imageUrl"
                :key="i"
                @click.prevent="t.currentSlide = i"
                class="w-2 h-2 rounded-full cursor-pointer"
                :class="i === (t.currentSlide || 0) ? 'bg-white' : 'bg-white/50'"
              ></div>
            </div>
          </template>
        </div>
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
          <router-link 
            :to="`/community/${t.id}`" 
            class="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="text-sm font-medium">{{ t.commentsCount || 0 }}</span>
          </router-link>
          <button 
            @click="share(t)" 
            class="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" 
            aria-label="Share"
            title="Share thought"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span class="text-sm">Share</span>
          </button>
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
const sidebarOpen = ref(false); // Collapsible sidebar state

const form = ref({ title: '', body: '', imageUrl: '', imagePreview: null, imageFile: null, mediaFiles: [], mediaPreviews: [], mediaType: null, currentSlide: 0, selectedCommunity: null });
const bodyTextarea = ref(null);
const fileInput = ref(null);
const uploading = ref(false);

// Community selector state
const communitySearchQuery = ref('');
const showCommunityDropdown = ref(false);

// Communities state
const communities = ref([]);
const showAddCommunity = ref(false);
const communityForm = ref({ name: '', description: '' });
const communityTouched = ref({ name: false });
const addingCommunity = ref(false);

// Computed: Filter communities based on search query
const filteredCommunities = computed(() => {
  if (!communitySearchQuery.value.trim()) {
    return communities.value;
  }
  const query = communitySearchQuery.value.toLowerCase();
  return communities.value.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.description?.toLowerCase().includes(query)
  );
});

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

// Helper: Get community name by ID
function getCommunityName(communityId) {
  if (!communityId) return null;
  const community = communities.value.find(c => c.id === communityId);
  return community?.name || null;
}

// Community selector functions
function selectCommunityForThought(community) {
  form.value.selectedCommunity = community;
  communitySearchQuery.value = community.name;
  showCommunityDropdown.value = false;
}

function clearSelectedCommunity() {
  form.value.selectedCommunity = null;
  communitySearchQuery.value = '';
}

function handleCommunityBlur() {
  // Delay to allow click on dropdown item
  setTimeout(() => {
    showCommunityDropdown.value = false;
  }, 200);
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
    t.currentSlide = 0; // Initialize carousel slide
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
    
    // Upload media files if there are any
    let imageUrl = form.value.imageUrl || '';
    if (form.value.mediaFiles.length > 0) {
      uploading.value = true;
      if (form.value.mediaType === 'video') {
        // Upload single video
        imageUrl = await uploadImage(form.value.mediaFiles[0]);
      } else {
        // Upload multiple images and store as array
        const uploadPromises = form.value.mediaFiles.map(file => uploadImage(file));
        const urls = await Promise.all(uploadPromises);
        imageUrl = urls.length === 1 ? urls[0] : urls; // Store as string if 1, array if multiple
      }
      uploading.value = false;
    }
    
    const payload = {
      title: form.value.title.trim(),
      body: form.value.body.trim(),
      imageUrl: imageUrl,
      communityId: form.value.selectedCommunity?.id || activeCommunityId.value || undefined
    };

    const t = await createThoughtApi(payload);
    thoughts.value.unshift(t);

    // reset & close
    form.value = { title: '', body: '', imageUrl: '', imagePreview: null, imageFile: null, mediaFiles: [], mediaPreviews: [], mediaType: null, currentSlide: 0, selectedCommunity: null };
    communitySearchQuery.value = '';
    touched.value = { title: false, body: false };
    showComposer.value = false;
  } catch (err) {
    console.error('createThought failed:', err?.response?.data || err?.message || err);
  } finally {
    submitting.value = false;
    uploading.value = false;
  }
}

// Upload image to backend
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3001'}/api/thoughts/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) throw new Error('Upload failed');
  const data = await response.json();
  return data.imageUrl;
}

// Handle file selection from button
function handleFileSelect(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;
  
  const firstFile = files[0];
  const isVideoFile = firstFile.type.startsWith('video/') || firstFile.name.endsWith('.gif');
  
  if (isVideoFile) {
    // Only allow 1 video
    if (files.length > 1) {
      alert('Only 1 video/gif allowed');
      return;
    }
    setMediaFiles(files, 'video');
  } else if (firstFile.type.startsWith('image/')) {
    // Allow multiple images
    setMediaFiles(files, 'image');
  } else {
    alert('Please select image or video files');
    return;
  }
}

// Handle paste event
function handlePaste(event) {
  const items = event.clipboardData?.items;
  if (!items) return;
  
  const files = [];
  for (const item of items) {
    if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  
  if (files.length > 0) {
    event.preventDefault();
    const isVideoFile = files[0].type.startsWith('video/');
    if (isVideoFile && files.length > 1) {
      setMediaFiles([files[0]], 'video'); // Only first video
    } else if (isVideoFile) {
      setMediaFiles(files, 'video');
    } else {
      setMediaFiles(files, 'image');
    }
  }
}

// Set media files and create previews
function setMediaFiles(files, type) {
  form.value.mediaFiles = files;
  form.value.mediaType = type;
  form.value.mediaPreviews = [];
  form.value.currentSlide = 0;
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.mediaPreviews.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// Remove media
function removeImage() {
  form.value.mediaFiles = [];
  form.value.mediaPreviews = [];
  form.value.mediaType = null;
  form.value.imageFile = null;
  form.value.imagePreview = null;
  form.value.imageUrl = '';
  form.value.currentSlide = 0;
  if (fileInput.value) fileInput.value.value = '';
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
    // Sort: pinned (favourited) communities first
    const sorted = (data.items || []).sort((a, b) => {
      if (a.favourited && !b.favourited) return -1;
      if (!a.favourited && b.favourited) return 1;
      return 0;
    });
    communities.value = sorted;
  } catch (e) {
    console.error('fetchCommunities failed', e);
  }
}

async function selectCommunity(id) {
  if (activeCommunityId.value === id) return;
  activeCommunityId.value = id;
  await loadPage(null);
}

function avatarSrcFor(thought) {
  // If backend provided filename like "pikachu.png", build API route URL.
  // If no avatar set, return null and we’ll fall back to the initial.
  
  if (!thought?.authorAvatar) return null;
  return `/api/cards/images/avatar/${encodeURIComponent(thought.authorAvatar)}`;
}


async function toggleFavourite(c) {
  // optimistic toggle
  const prev = !!c.favourited;
  c.favourited = !prev;
  
  // Re-sort immediately for instant UI feedback
  communities.value.sort((a, b) => {
    if (a.favourited && !b.favourited) return -1;
    if (!a.favourited && b.favourited) return 1;
    return 0;
  });
  
  try {
    await toggleCommunityFavourite(c.id, c.favourited);
  } catch (e) {
    c.favourited = prev; // rollback
    // Re-sort again after rollback
    communities.value.sort((a, b) => {
      if (a.favourited && !b.favourited) return -1;
      if (!a.favourited && b.favourited) return 1;
      return 0;
    });
    console.error('toggle favourite failed', e);
  }
}

function openAddCommunity() {
  communityTouched.value = { name: false };
  communityForm.value = { name: '', description: '' };
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


