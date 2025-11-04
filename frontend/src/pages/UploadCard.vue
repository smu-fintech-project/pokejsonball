<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div class="bg-white/80 dark:bg-slate-900/70 backdrop-blur rounded-3xl shadow-xl p-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 rounded-full text-xs font-semibold uppercase tracking-widest">
              <UploadCloud class="w-4 h-4" />
              Submit Your Card
            </div>
            <h1 class="mt-4 text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Upload a Pokémon Card
            </h1>
            <p class="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl">
              Share your latest catch with the community. Manually enter certification details or upload a picture of your card.
            </p>
          </div>
          <div class="bg-white/80 dark:bg-slate-800/70 border border-red-100/60 dark:border-slate-700 rounded-2xl p-4 w-full md:w-auto">
            <div class="flex items-center gap-3">
              <ClipboardList class="w-10 h-10 text-red-500" />
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">PSA Certification Required</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">All cards require PSA certification for authenticity guarantee.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          @click="mode = 'manual'"
          :class="[
            'flex items-center justify-between gap-4 px-6 py-5 rounded-2xl border-2 transition-all shadow-sm',
            mode === 'manual'
              ? 'border-red-500 bg-white dark:bg-slate-900 text-red-600 dark:text-red-300 shadow-lg'
              : 'border-transparent bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-red-200 hover:text-red-500'
          ]"
        >
          <div class="flex items-center gap-4">
            <FileText class="w-10 h-10" />
            <div class="text-left">
              <p class="text-lg font-semibold">Enter Details Manually</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Provide the PSA certification number to fetch the rest.</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          @click="mode = 'upload'"
          :class="[
            'flex items-center justify-between gap-4 px-6 py-5 rounded-2xl border-2 transition-all shadow-sm',
            mode === 'upload'
              ? 'border-red-500 bg-white dark:bg-slate-900 text-red-600 dark:text-red-300 shadow-lg'
              : 'border-transparent bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-red-200 hover:text-red-500'
          ]"
        >
          <div class="flex items-center gap-4">
            <ImagePlus class="w-10 h-10" />
            <div class="text-left">
              <p class="text-lg font-semibold">Upload Card Image</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Drag & drop the front scan for instant submission.</p>
            </div>
          </div>
        </button>
      </div>

      <section v-if="mode === 'manual'" class="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-3xl shadow-xl p-8 space-y-8">
        <header class="space-y-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Manual entry</h2>
          <p class="text-slate-600 dark:text-slate-400">Just drop in the PSA certification number and we&rsquo;ll fetch everything else for you.</p>
        </header>

        <form @submit.prevent="handleManualSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200" for="cert-number">Certification Number *</label>
            <input
              id="cert-number"
              v-model="manualForm.cert_number"
              type="text"
              required
              inputmode="numeric"
              class="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm"
            />
          </div>

          <div class="flex flex-col lg:flex-row gap-6">
            <div class="flex-1 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-3">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Why just the cert number?</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                The PSA certification number is unique to each graded card. Once submitted, our service can look up the latest metadata,
                imagery, and population reports automatically.
              </p>
            </div>
            <div class="flex-1 rounded-2xl border border-red-200/70 dark:border-red-900/50 bg-red-50/60 dark:bg-red-900/30 p-6 space-y-3">
              <div class="flex items-center gap-3 text-red-700 dark:text-red-200">
                <CheckCircle2 class="w-5 h-5" />
                <span class="font-semibold">Fast verification</span>
              </div>
              <p class="text-sm text-red-700/80 dark:text-red-200/80">
                We validate the cert directly with PSA. If anything looks off, you&rsquo;ll get a prompt to double-check before the card is published.
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 flex-wrap">
            <p class="text-sm text-slate-500 dark:text-slate-400">Required: PSA certification number only.</p>
            <button
              type="submit"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
              :disabled="certLookup.loading || !isManualValid"
            >
              <Loader2 v-if="certLookup.loading" class="w-5 h-5 animate-spin" />
              <FileText v-else class="w-5 h-5" />
              <span>{{ certLookup.loading ? 'Checking...' : 'Verify Now' }}</span>
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-if="certLookup.loading"
              class="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200"
            >
              <Loader2 class="w-5 h-5 animate-spin" />
              <span>Validating certification number with PSA...</span>
            </div>

            <div
              v-if="manualMessage"
              :class="[
                'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
                manualMessageType === 'success'
                  ? 'border-emerald-200 bg-emerald-50/90 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200'
                  : 'border-rose-200 bg-rose-50/90 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200'
              ]"
            >
              <template v-if="manualMessageType === 'success'">
                <CheckCircle2 class="w-5 h-5 mt-0.5" />
              </template>
              <template v-else>
                <AlertTriangle class="w-5 h-5 mt-0.5" />
              </template>
              <span>{{ manualMessage }}</span>
            </div>
          </div>
        </form>
      </section>

      <section v-else class="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-3xl shadow-xl p-8 space-y-6">
        <header class="space-y-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Upload card imagery</h2>
          <p class="text-slate-600 dark:text-slate-400">Drop a high-resolution JPEG or PNG of the front. File size limit: 15&nbsp;MB.</p>
        </header>

        <div class="grid grid-cols-1 gap-6">
          <label
            class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer"
            :class="[
              dragOver.front
                ? 'border-red-500 bg-red-100/40 dark:bg-red-900/40'
                : 'border-slate-300 dark:border-slate-600 hover:border-red-400 hover:bg-red-50/40 dark:hover:border-red-500 dark:hover:bg-red-900/30'
            ]"
            @dragover.prevent="setDrag('front', true)"
            @dragleave.prevent="setDrag('front', false)"
            @drop.prevent="handleDrop($event, 'front')"
          >
            <input type="file" accept="image/*" class="hidden" @change="onFileChange($event, 'front')" />
            <CloudUpload class="w-10 h-10 text-red-500" />
            <div>
              <p class="text-base font-semibold text-slate-900 dark:text-white">Front of card</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Drag & drop or click to browse</p>
            </div>
            <p v-if="frontFile" class="text-xs text-red-600 dark:text-red-300">{{ frontFile.name }}</p>
          </label>
        </div>

        <div v-if="frontPreview" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <img :src="frontPreview" alt="Front preview" class="w-full h-72 object-cover" />
            <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300">
              Front preview
            </div>
          </div>
        </div>

        <div v-if="detection.loading" class="flex items-center gap-3 text-sm text-red-600 dark:text-red-300 bg-red-50/70 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          <Loader2 class="w-4 h-4 animate-spin" />
          <span>Detecting PSA certification number...</span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div class="text-sm text-slate-500 dark:text-slate-400">
            We will extract PSA metadata automatically from your image once submitted.
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
              :disabled="!frontFile || detection.loading"
              @click="handleUploadSubmit"
            >
              <UploadCloud class="w-5 h-5" />
              {{ detection.loading ? 'Detecting…' : 'Retry Detection' }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              :disabled="!frontFile || detection.loading"
              @click="clearImage"
            >
              <span>Remove Image</span>
            </button>
          </div>
        </div>

        <p v-if="uploadMessage" class="text-sm"
          :class="uploadMessageType === 'success'
            ? 'text-emerald-600'
            : uploadMessageType === 'info'
              ? 'text-red-500'
              : 'text-rose-500'">
          {{ uploadMessage }}
        </p>
      </section>

      <section
        v-if="certLookup.data"
        class="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-3xl shadow-xl p-8 space-y-6"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/40 overflow-hidden">
            <img
              v-if="primaryImage"
              :src="primaryImage"
              alt="PSA front scan"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex flex-col items-center justify-center h-72 text-sm text-slate-500 dark:text-slate-400">
              <ImagePlus class="w-8 h-8 mb-3 opacity-70" />
              <span>No PSA imagery available</span>
            </div>
          </div>

          <div class="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 space-y-4">
            <div class="space-y-1">
              <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Card Preview</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Review the PSA details and upload to Firebase when ready.</p>
            </div>

            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200 text-xs font-semibold">
                Cert #{{ certLookup.data.cert_number }}
              </span>
              <span
                v-if="certLookup.data.grade"
                class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 text-xs font-semibold"
              >
                PSA {{ certLookup.data.grade }}
              </span>
              <span
                v-if="certLookup.data.card_number"
                class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 text-xs font-semibold"
              >
                Card #{{ certLookup.data.card_number }}
              </span>
            </div>

            <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li v-if="certLookup.data.item_title">
                <span class="font-semibold text-slate-900 dark:text-white">Title:</span>
                {{ certLookup.data.item_title }}
              </li>
              <li v-if="certLookup.data.year">
                <span class="font-semibold text-slate-900 dark:text-white">Year:</span>
                {{ certLookup.data.year }}
              </li>
              <li v-if="certLookup.data.brand_title">
                <span class="font-semibold text-slate-900 dark:text-white">Brand:</span>
                {{ certLookup.data.brand_title }}
              </li>
              <li v-if="certLookup.data.category">
                <span class="font-semibold text-slate-900 dark:text-white">Category:</span>
                {{ certLookup.data.category }}
              </li>
              <li v-if="certLookup.data.variety_pedigree">
                <span class="font-semibold text-slate-900 dark:text-white">Variety / Pedigree:</span>
                {{ certLookup.data.variety_pedigree }}
              </li>
              <li v-if="certLookup.data.psa_population">
                <span class="font-semibold text-slate-900 dark:text-white">PSA Population:</span>
                {{ certLookup.data.psa_population }}
              </li>
              <li v-if="certLookup.data.psa_pop_higher">
                <span class="font-semibold text-slate-900 dark:text-white">PSA Pop Higher:</span>
                {{ certLookup.data.psa_pop_higher }}
              </li>
            </ul>

            <div
              v-if="certLookup.data.last_sale && (certLookup.data.last_sale.price || certLookup.data.last_sale.market)"
              class="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200"
            >
              <div class="text-xs uppercase tracking-wide font-semibold">Recent Market Insight</div>
              <div class="mt-1 text-base font-semibold">
                <template v-if="certLookup.data.last_sale.price">
                  {{ formatCurrency(certLookup.data.last_sale.price, certLookup.data.last_sale.currency || '$') }}
                </template>
                <template v-else>
                  {{ certLookup.data.last_sale.market || certLookup.data.last_sale.source }}
                </template>
              </div>
              <div class="text-xs mt-1">
                <span v-if="certLookup.data.last_sale.market">Market: {{ certLookup.data.last_sale.market }}</span>
                <span v-if="certLookup.data.last_sale.date" class="ml-2">Date: {{ certLookup.data.last_sale.date }}</span>
              </div>
              <div v-if="certLookup.data.last_sale.source" class="text-xs mt-1 opacity-80">
                Source: {{ certLookup.data.last_sale.source }}
              </div>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                :disabled="certLookup.ingesting"
                @click="handleIngest"
              >
                <Loader2 v-if="certLookup.ingesting" class="w-5 h-5 animate-spin" />
                <UploadCloud v-else class="w-5 h-5" />
                <span>{{ certLookup.ingesting ? 'Uploading...' : 'Upload to Firebase' }}</span>
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                :disabled="certLookup.ingesting"
                @click="resetManualFlow"
              >
                Clear Preview
              </button>
            </div>

            <div
              v-if="certLookup.ingestSuccess"
              class="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200 space-y-3"
            >
              <p>{{ certLookup.ingestSuccess }}</p>
              <button
                type="button"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700"
                @click="goToMarketplace"
              >
                <Package class="w-4 h-4" />
                View Marketplace
              </button>
            </div>

            <div
              v-if="certLookup.ingestError"
              class="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200"
            >
              {{ certLookup.ingestError }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  UploadCloud,
  FileText,
  ImagePlus,
  CloudUpload,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Package
} from 'lucide-vue-next'

const mode = ref('manual')
const frontFile = ref(null)
const frontPreview = ref('')
const uploadMessage = ref('')
const uploadMessageType = ref('success')

const dragOver = reactive({ front: false })

const detection = reactive({
  loading: false,
  confidence: null,
  certNumber: ''
})

const manualForm = reactive({
  cert_number: ''
})

const manualMessage = ref('')
const manualMessageType = ref('success')

const requiredFields = ['cert_number']
const isManualValid = computed(() => requiredFields.every((field) => manualForm[field] !== '' && manualForm[field] !== null))

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

const certLookup = reactive({
  loading: false,
  data: null,
  ingesting: false,
  ingestSuccess: '',
  ingestError: ''
})

const router = useRouter()

const primaryImage = computed(() => {
  if (!certLookup.data) return ''
  const images = certLookup.data.images || {}
  return images.left || images.front || images.primary || images.right || ''
})

function setDrag(side, value) {
  dragOver[side] = value
}

function handleDrop(event, side) {
  const [file] = event.dataTransfer?.files || []
  if (!file) return
  assignFile(file, side)
  dragOver[side] = false
}

function onFileChange(event, side) {
  const [file] = event.target.files || []
  if (!file) return
  assignFile(file, side)
  event.target.value = ''
}

async function assignFile(file, side) {
  if (side !== 'front') return
  if (!file.type.startsWith('image/')) {
    uploadMessage.value = 'Only image files are supported.'
    uploadMessageType.value = 'error'
    return
  }

  if (frontPreview.value) URL.revokeObjectURL(frontPreview.value)

  frontFile.value = file
  frontPreview.value = URL.createObjectURL(file)
  uploadMessage.value = ''
  detection.certNumber = ''
  detection.confidence = null

  resetManualFlow()
  mode.value = 'upload'

  try {
    await detectCertFromImage(file)
  } catch (error) {
    // errors are already surfaced through uploadMessage; swallow here
    console.error(error)
  }
}

async function handleUploadSubmit() {
  if (!frontFile.value) {
    uploadMessage.value = 'Please attach the front image before submitting.'
    uploadMessageType.value = 'error'
    return
  }
  try {
    await detectCertFromImage(frontFile.value)
  } catch (error) {
    console.error(error)
  }
}

async function detectCertFromImage(file) {
  const token = localStorage.getItem('token')
  if (!token) {
    uploadMessageType.value = 'error'
    uploadMessage.value = 'You need to sign in before verifying PSA certifications.'
    return
  }

  const fileSizeMb = file.size / (1024 * 1024)
  if (fileSizeMb > 15) {
    uploadMessageType.value = 'error'
    uploadMessage.value = 'The image is too large (max 15 MB). Please upload a smaller photo.'
    return
  }

  detection.loading = true
  uploadMessageType.value = 'info'
  uploadMessage.value = 'Detecting certification number from the uploaded photo...'

  try {
    const response = await fetch(`${API_BASE}/api/certs/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ image: await fileToBase64(file) })
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload?.success || !payload?.certNumber) {
      const message = payload?.message || 'We could not read the certification number. Please upload another photo.'
      uploadMessageType.value = 'error'
      uploadMessage.value = message
      detection.certNumber = ''
      detection.confidence = null
      return
    }

    detection.certNumber = payload.certNumber
    detection.confidence = payload.confidence ?? null
    const confidenceNote = typeof detection.confidence === 'number'
      ? ` (~${Math.round(detection.confidence * 100)}% confidence)`
      : ''
    uploadMessageType.value = 'info'
    uploadMessage.value = `Detected certification #${payload.certNumber}${confidenceNote}. Fetching PSA details...`

    manualForm.cert_number = payload.certNumber
    manualMessage.value = ''

    const result = await fetchCertData(payload.certNumber, token)

    if (!result.ok) {
      uploadMessageType.value = 'error'
      uploadMessage.value = result.message
      return
    }

    uploadMessageType.value = 'success'
    uploadMessage.value = `Certification ${payload.certNumber} loaded. Review the preview below before uploading to Firebase.`
  } catch (error) {
    uploadMessageType.value = 'error'
    uploadMessage.value = error.message || 'We could not read the certification number. Please upload another photo.'
    detection.certNumber = ''
    detection.confidence = null
    throw error
  } finally {
    detection.loading = false
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read the image file.'))
    reader.readAsDataURL(file)
  })
}

function clearImage() {
  if (frontPreview.value) {
    URL.revokeObjectURL(frontPreview.value)
  }
  frontPreview.value = ''
  frontFile.value = null
  detection.certNumber = ''
  detection.confidence = null
  uploadMessage.value = ''
  uploadMessageType.value = 'success'
  resetManualFlow()
}

function mapCertError(status, payload, certNumber) {
  if (status === 401) {
    return 'Your session does not have access to PSA services. Please sign in as an administrator.'
  }
  if (status === 403 && payload?.error === 'AUTH_FAILED') {
    return 'PSA API authentication failed. Check that the backend has a working PSA API key.'
  }
  if (status === 403 && payload?.error === 'Invalid token') {
    return 'Your session is invalid or expired. Please sign in again.'
  }
  if (status === 404 || payload?.error === 'CERT_NOT_FOUND') {
    return `We could not find PSA certificate ${certNumber}. Double-check the number and try again.`
  }
  return payload?.message || 'Unable to verify that certification number right now.'
}

async function fetchCertData(certNumber, token) {
  if (!token) {
    return { ok: false, message: 'You need to sign in before verifying PSA certifications.' }
  }

  certLookup.loading = true
  certLookup.data = null
  certLookup.ingestSuccess = ''
  certLookup.ingestError = ''

  try {
    const response = await fetch(`${API_BASE}/api/certs/${certNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload?.success || !payload?.cert) {
      const message = mapCertError(response.status, payload, certNumber)
      return { ok: false, message }
    }

    certLookup.data = payload.cert
    return { ok: true, cert: payload.cert }
  } catch (error) {
    return { ok: false, message: error.message || 'Unexpected error while contacting the PSA service.' }
  } finally {
    certLookup.loading = false
  }
}

async function handleManualSubmit() {
  if (!isManualValid.value) {
    manualMessageType.value = 'error'
    manualMessage.value = 'Please enter a PSA certification number.'
    return
  }

  const certNumber = manualForm.cert_number.trim()
  manualMessage.value = ''

  if (!/^[0-9]+$/.test(certNumber)) {
    manualMessageType.value = 'error'
    manualMessage.value = 'Certification numbers must be numeric.'
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    manualMessageType.value = 'error'
    manualMessage.value = 'You need to sign in before verifying PSA certifications.'
    return
  }

  const result = await fetchCertData(certNumber, token)

  if (!result.ok) {
    manualMessageType.value = 'error'
    manualMessage.value = result.message
    return
  }

  manualMessageType.value = 'success'
  manualMessage.value = `Certification ${certNumber} found. Review the PSA details below before uploading.`
}

async function handleIngest() {
  if (!certLookup.data) return

  const token = localStorage.getItem('token')
  if (!token) {
    certLookup.ingestError = 'You need to sign in before uploading cards to Firebase.'
    return
  }

  certLookup.ingesting = true
  certLookup.ingestSuccess = ''
  certLookup.ingestError = ''

  try {
    const ownerEmail = localStorage.getItem('userEmail') || null
    const response = await fetch(`${API_BASE}/api/certs/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        certNumber: certLookup.data.cert_number,
        ownerEmail
      })
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload?.success) {
      if (response.status === 401) {
        certLookup.ingestError = 'Your session does not have permission to upload cards.'
      } else if (response.status === 409) {
        certLookup.ingestError = payload?.message || 'This certification already exists in Firebase.'
      } else {
        certLookup.ingestError = payload?.message || 'Failed to upload the card to Firebase.'
      }
      return
    }

    certLookup.ingestSuccess = 'Card uploaded to Firebase successfully. Check the marketplace to see it live.'
  } catch (error) {
    certLookup.ingestError = error.message || 'Failed to upload the card to Firebase.'
  } finally {
    certLookup.ingesting = false
  }
}

function resetManualFlow() {
  manualForm.cert_number = ''
  manualMessage.value = ''
  manualMessageType.value = 'success'
  certLookup.data = null
  certLookup.loading = false
  certLookup.ingestSuccess = ''
  certLookup.ingestError = ''
  certLookup.ingesting = false
  detection.certNumber = ''
  detection.confidence = null
  uploadMessage.value = ''
  uploadMessageType.value = 'success'
}

function goToMarketplace() {
  router.push('/')
}

function formatCurrency(amount, symbol = '$') {
  if (amount === undefined || amount === null || amount === '') return null
  const numeric = Number(amount)
  if (Number.isNaN(numeric)) return `${symbol}${amount}`
  const formatted = numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${symbol}${formatted}`
}

onBeforeUnmount(() => {
  if (frontPreview.value) {
    URL.revokeObjectURL(frontPreview.value)
  }
})
</script>

<style scoped>
</style>
