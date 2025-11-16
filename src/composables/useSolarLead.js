// src/composables/useSolarLead.js
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { postLead } from '../service/apiClient'
import {
  estimateMonthlyKwh,
  estimateSystemSizeKw,
  estimatePanels,
  estimateYearlyKwh,
  estimateYearlySavingsArs,
} from '../service/solarMath'

export function useSolarLead() {
  console.log('[solar-calculator] useSolarLead inicializado')

  const step = ref(1)
  const totalSteps = 4
  const formRef = ref(null)
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const showSuccess = ref(false)
  const lastLead = ref(null)

  const createInitialForm = () => ({
    city: '',
    province: null,
    country: 'AR',
    purpose: null,
    usage: null,
    currentBill: null,
    fullName: '',
    phone: '',
    email: '',
  })

  const form = reactive(createInitialForm())

  // OPCIONES
  const provinces = [
    { value: 'BA', label: 'Buenos Aires' },
    { value: 'CABA', label: 'CABA' },
    { value: 'SJ', label: 'San Juan' },
    { value: 'SL', label: 'San Luis' },
    { value: 'MZA', label: 'Mendoza' },
    { value: 'CB', label: 'Córdoba' },
  ]

  const countries = [{ value: 'AR', label: 'Argentina' }]

  const purposes = [
    { value: '1', label: '1 - Para bajar la huella de carbono.', driver: 'sustentabilidad' },
    { value: '2', label: '2 - Para generar un ahorro en la factura eléctrica.', driver: 'ahorro' },
    { value: '3', label: '3 - Para tener autonomía en caso de cortes de servicio.', driver: 'autonomia' },
    { value: '4', label: '4 - Para tener energía donde no llega la red.', driver: 'offgrid' },
    { value: '5', label: '5 - Para un motor home.', driver: 'movil' },
    { value: '6', label: '6 - Bombeo solar para campos.', driver: 'bombeo' },
    { value: '7', label: '7 - Opciones 1, 2, 3 y 4.', driver: 'mixto' },
  ]

  const usages = [
    { value: 'home',     label: 'Mi casa',                               segment: 'Residencial' },
    { value: 'commerce', label: 'Mi comercio',                           segment: 'Comercial' },
    { value: 'company',  label: 'Mi empresa',                            segment: 'Comercial' },
    { value: 'weekend',  label: 'Mi casa de fin de semana o veraneo',    segment: 'Residencial' },
    { value: 'agro',     label: 'Para establecimientos agrícolas',       segment: 'Agro / Rural' },
    { value: 'other',    label: 'Otros',                                 segment: 'Otros' },
  ]

  const purposeMap = computed(() =>
    Object.fromEntries(purposes.map(p => [p.value, p])),
  )
  const usageMap = computed(() =>
    Object.fromEntries(usages.map(u => [u.value, u])),
  )

  // VALIDACIONES
  const rules = {
    required: v => !!v || 'Campo obligatorio',
    requiredNumber: v =>
      (v !== null && v !== '' && !isNaN(Number(v))) || 'Ingresá un valor numérico',
    email: v => !v || /.+@.+\..+/.test(v) || 'Email inválido',
  }

  // NAVEGACIÓN DE PASOS
  const goNext = async () => {
    errorMessage.value = ''
    if (!formRef.value) return
    const { valid } = await formRef.value.validate()
    if (valid && step.value < totalSteps) {
      step.value++
      formRef.value.resetValidation()
    }
  }

  const goPrev = () => {
    errorMessage.value = ''
    if (step.value > 1) {
      step.value--
      formRef.value?.resetValidation()
    }
  }

  // PRIORIDAD / CRM
  function estimatePriority(purposeValue, monthlyBill) {
    const bill = Number(monthlyBill) || 0
    const driver = purposeMap.value[purposeValue]?.driver

    if (bill > 60000 || driver === 'mixto') return 'Muy alta'
    if (bill > 30000 || driver === 'ahorro' || driver === 'autonomia') return 'Alta'
    if (driver === 'bombeo' || driver === 'offgrid') return 'Proyecto específico'
    if (driver === 'sustentabilidad') return 'Media'
    return 'A evaluar'
  }

  function mapPropertyType(usageValue) {
    switch (usageValue) {
      case 'home':
        return 'Hogar'
      case 'weekend':
        return 'Hogar fin de semana'
      case 'commerce':
      case 'company':
        return 'Comercial / Empresa'
      case 'agro':
        return 'Campo / Agro'
      case 'other':
      default:
        return 'Otros'
    }
  }

  function mapCrmScore(priorityLabel) {
    const k = String(priorityLabel || '').toLowerCase()
    if (k.includes('muy alta')) return 90
    if (k.includes('alta')) return 75
    if (k.includes('proyecto')) return 65
    if (k.includes('media')) return 50
    return 40
  }

  function buildCrmTags(usage, purpose, segment) {
    const tags = ['web', 'simulador-solar']
    if (usage?.value) tags.push(`uso:${usage.value}`)
    if (segment) tags.push(`segmento:${segment}`)
    if (purpose?.driver) tags.push(`driver:${purpose.driver}`)
    return tags.join(', ')
  }

  // PAYLOAD
  function buildLeadPayload() {
    const province = provinces.find(p => p.value === form.province) || null
    const country = countries.find(c => c.value === form.country) || null
    const purpose = purposeMap.value[form.purpose] || null
    const usage = usageMap.value[form.usage] || null

    const monthlyBillNumber = form.currentBill ? Number(form.currentBill) : null

    const monthlyKwh = estimateMonthlyKwh(monthlyBillNumber)
    const systemSizeKw = estimateSystemSizeKw(monthlyKwh)
    const priority = estimatePriority(form.purpose, form.currentBill)

    const panels = estimatePanels(systemSizeKw)
    const yearlyKwh = estimateYearlyKwh(monthlyKwh)
    const yearlySavings = estimateYearlySavingsArs(monthlyBillNumber)
    const propertyType = mapPropertyType(form.usage)

    const crmStatus = 'nuevo'
    const crmScore = mapCrmScore(priority)
    const tags = buildCrmTags(usage, purpose, usage?.segment)

    return {
      location: {
        city: form.city || null,
        provinceCode: province?.value || null,
        provinceName: province?.label || null,
        countryCode: country?.value || null,
        countryName: country?.label || null,
      },
      project: {
        purposeCode: purpose?.value || null,
        purposeLabel: purpose?.label || null,
        purposeDriver: purpose?.driver || null,
        usageCode: usage?.value || null,
        usageLabel: usage?.label || null,
        segment: usage?.segment || null,
        propertyType,

        monthlyBillArs: monthlyBillNumber,
        estimatedMonthlyKwh: monthlyKwh,
        estimatedSystemSizeKw: systemSizeKw,
        priority,

        estimatedPanels: panels,
        estimatedInverterKw: systemSizeKw ? Number(systemSizeKw.toFixed(1)) : null,
        estimatedYearlyKwh: yearlyKwh,
        estimatedYearlySavingsArs: yearlySavings,
        paybackYears: null,
      },
      contact: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
      },
      crm: {
        crmStatus,
        crmScore,
        assignedTo: null,
        lastContactAt: null,
        nextActionAt: null,
        nextActionType: null,
        internalNotes: null,
        tags,
      },
      meta: {
        createdAt: new Date().toISOString(),
        sourceUrl: typeof window !== 'undefined' ? window.location.href : null,
        sourceTag: 'web-grupoalade-simulador-solar',
      },
    }
  }

  // ENVÍO
  const handleSubmit = async () => {
    errorMessage.value = ''

    if (!formRef.value) return
    const { valid } = await formRef.value.validate()
    if (!valid) return

    const payload = buildLeadPayload()
    isSubmitting.value = true

    console.log('[solar-calculator] Enviando lead', payload)

    try {
      const data = await postLead(payload)

      if (!data.ok) {
        console.error('[solar-calculator] Respuesta backend no OK:', data)
        errorMessage.value =
          'No pudimos registrar tu solicitud, contactanos por los canales habituales.'
        return
      }

      console.log('[solar-calculator] Lead generado OK', data)

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('solar-calculator:lead', {
            detail: data.lead || payload,
          }),
        )
      }

      lastLead.value = data.lead || payload
      showSuccess.value = true
    } catch (err) {
      console.error('[solar-calculator] Error al enviar lead:', err)
      errorMessage.value =
        'No pudimos conectar con el servidor. Verificá tu conexión e intentá de nuevo.'
    } finally {
      isSubmitting.value = false
    }
  }

  // RESÚMENES
  const summaryLocation = computed(() => {
    const province = provinces.find(p => p.value === form.province)
    const country = countries.find(c => c.value === form.country)
    const parts = [form.city, province?.label, country?.label].filter(Boolean)
    return parts.length ? parts.join(', ') : 'Sin datos'
  })

  const summaryUsage = computed(() => {
    const usage = usageMap.value[form.usage]
    const purpose = purposeMap.value[form.purpose]
    if (!usage && !purpose) return 'Sin datos'
    if (usage && purpose) return `${usage.label} · ${purpose.label}`
    return (usage?.label || purpose?.label) ?? 'Sin datos'
  })

  const summaryBill = computed(() => {
    if (!form.currentBill) return 'Sin dato'
    const n = Number(form.currentBill)
    return `Aprox. $${n.toLocaleString('es-AR')} / mes`
  })

  const previewKwh = computed(() => estimateMonthlyKwh(form.currentBill))
  const previewSystemSize = computed(() =>
    estimateSystemSizeKw(previewKwh.value),
  )

  const summarySystemSize = computed(() => {
    if (!previewSystemSize.value || !previewKwh.value) {
      return 'A estimar con más detalle'
    }
    return `${previewSystemSize.value} kWp (≈ ${previewKwh.value} kWh/mes)`
  })

  // RESET / CIERRE
  const closeOnly = () => {
    showSuccess.value = false
  }

  const resetFlow = () => {
    showSuccess.value = false
    Object.assign(form, createInitialForm())
    step.value = 1
    errorMessage.value = ''
    lastLead.value = null
    formRef.value?.resetValidation()
  }

  // 🔗 INTEGRACIÓN CON LA CALCULADORA (evento solar-calculator:use-bill)
  let removeListener = null

  onMounted(() => {
    if (typeof window === 'undefined') return

    const handler = evt => {
      const bill = evt.detail
      console.log('[solar-calculator] Recibido use-bill:', bill)

      if (bill != null && !Number.isNaN(Number(bill))) {
        form.currentBill = Number(bill)
        // nos aseguramos de estar al menos en el paso 3 (uso + factura)
        if (step.value < 3) step.value = 3
      }
    }

    window.addEventListener('solar-calculator:use-bill', handler)
    removeListener = () =>
      window.removeEventListener('solar-calculator:use-bill', handler)
  })

  onBeforeUnmount(() => {
    if (removeListener) removeListener()
  })

  return {
    step,
    totalSteps,
    formRef,
    form,
    provinces,
    countries,
    purposes,
    usages,
    rules,
    isSubmitting,
    errorMessage,
    showSuccess,
    lastLead,
    summaryLocation,
    summaryUsage,
    summaryBill,
    summarySystemSize,
    goNext,
    goPrev,
    handleSubmit,
    resetFlow,
    closeOnly,
  }
}
