<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createChart, AreaSeries } from 'lightweight-charts'

// Props
const props = defineProps({
  chartData: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Refs
const chartContainer = ref(null)
let chart = null
let lineSeries = null
let resizeHandler = null

// Detect dark mode
const isDarkMode = () => {
  return document.documentElement.classList.contains('dark')
}

// Get theme colors
const getThemeColors = () => {
  const dark = isDarkMode()
  return {
    backgroundColor: 'transparent',
    textColor: dark ? '#94a3b8' : '#64748b',
    gridColor: dark ? '#334155' : '#e2e8f0',
    lineColor: '#DC2626', // Red-600
    areaTopColor: 'rgba(220, 38, 38, 0.4)',
    areaBottomColor: 'rgba(220, 38, 38, 0.0)',
  }
}

// Initialize chart
const initChart = () => {
  if (!chartContainer.value) return

  const colors = getThemeColors()

  try {
    // Create chart with v5.x API
    chart = createChart(chartContainer.value, {
      width: chartContainer.value.clientWidth,
      height: chartContainer.value.clientHeight,
      layout: {
        background: {
          color: colors.backgroundColor,
        },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          color: colors.gridColor,
        },
      },
      crosshair: {
        vertLine: {
          width: 1,
          color: colors.gridColor,
          style: 2,
        },
        horzLine: {
          visible: false,
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Add area series using v5.0 API
    lineSeries = chart.addSeries(AreaSeries, {
      lineColor: colors.lineColor,
      topColor: colors.areaTopColor,
      bottomColor: colors.areaBottomColor,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
    })

    // Set initial data
    updateChartData()

    // Handle resize
    resizeHandler = () => {
      if (chart && chartContainer.value) {
        chart.applyOptions({
          width: chartContainer.value.clientWidth,
          height: chartContainer.value.clientHeight,
        })
      }
    }

    window.addEventListener('resize', resizeHandler)

    // Fit content
    if (chart && chart.timeScale) {
      chart.timeScale().fitContent()
    }
  } catch (error) {
    console.error('Error initializing chart:', error)
  }
}

// Update chart data
const updateChartData = () => {
  if (!lineSeries || !props.chartData || props.chartData.length === 0) {
    return
  }

  // Transform data to TradingView format
  const formattedData = props.chartData.map(item => ({
    time: item.time, // YYYY-MM-DD format
    value: item.value
  }))

  // Sort by time ascending
  formattedData.sort((a, b) => a.time.localeCompare(b.time))

  lineSeries.setData(formattedData)
  
  // Fit content after setting data
  if (chart) {
    chart.timeScale().fitContent()
  }
}

// Watch for data changes
watch(() => props.chartData, () => {
  updateChartData()
}, { deep: true })

// Watch for dark mode changes
watch(() => isDarkMode(), () => {
  if (chart && lineSeries) {
    const colors = getThemeColors()
    
    chart.applyOptions({
      layout: {
        textColor: colors.textColor,
      },
      grid: {
        horzLines: {
          color: colors.gridColor,
        },
      },
      crosshair: {
        vertLine: {
          color: colors.gridColor,
        },
      },
    })
    
    lineSeries.applyOptions({
      lineColor: colors.lineColor,
      topColor: colors.areaTopColor,
      bottomColor: colors.areaBottomColor,
    })
  }
})

// Lifecycle hooks
onMounted(async () => {
  await nextTick()
  initChart()
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  if (chart) {
    chart.remove()
    chart = null
    lineSeries = null
  }
})
</script>

<style scoped>
/* Ensure the container takes full dimensions */
div {
  position: relative;
}
</style>
