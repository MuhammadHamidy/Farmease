import { defineComponent, computed, ref, watch, onUnmounted } from 'vue'
import PerkebunanCardWrapper from './shared/PerkebunanCardWrapper'
import PerkebunanSelectorCard from './shared/PerkebunanSelectorCard'
import PerkebunanFormSelect from './shared/PerkebunanFormSelect'
import PerkebunanFormInput from './shared/PerkebunanFormInput'
import { getJenisIcon, getFormIcon } from './shared/pencatatanIcons'

export default defineComponent({
  name: 'PerkebunanRecordingCard',
  props: {
    selectedJenis: {
      type: String,
      required: true,
    },
    selectedRincian: {
      type: String,
      required: true,
    },
  },
  emits: ['openJenis', 'openRincian', 'next', 'save'],
  setup(props, { emit }) {
    const hasSelectedJenis = () => props.selectedJenis !== 'Jenis Pencatatan'
    const hasSelectedRincian = () => props.selectedRincian !== 'Rincian Pencatatan'

    const currentDate = ref(new Date())
    const timerId = setInterval(() => {
      currentDate.value = new Date()
    }, 1000)

    onUnmounted(() => {
      clearInterval(timerId)
    })

    const formattedDate = computed(() => {
      const day = currentDate.value.getDate()
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ]
      const month = months[currentDate.value.getMonth()]
      const year = currentDate.value.getFullYear()
      return `Tanggal : ${day} ${month} ${year}`
    })

    const formattedTime = computed(() => {
      const hour = String(currentDate.value.getHours()).padStart(2, '0')
      const minute = String(currentDate.value.getMinutes()).padStart(2, '0')
      return `${hour}.${minute} WIB`
    })

    const kindTitle = computed(() => {
      if (!hasSelectedJenis()) return ''
      // If Perawatan selected, mockup title is "Pemberian Obat"
      if (props.selectedJenis.toLowerCase().includes('perawatan')) {
        return 'Pemberian Obat'
      }
      return props.selectedJenis.replace(/^Pencatatan\s+/u, '')
    })

    const formState = ref({
      kodePohon: 'K001',
      deskripsiPenanaman: '',
      jumlahPemangkasan: '',
      deskripsiPemangkasan: '',
      jenisObat: 'Jenis Obat',
      kodePohonPerawatan: 'Kode Pohon',
      bagianPohon: 'Bagian Pohon',
      teknikPemberian: 'Teknik Pemberian Obat',
      namaObat: '',
      dosisObat: '',
      deskripsiPerawatan: '',
      // Pemupukan states:
      jenisPupuk: 'Jenis Pupuk',
      fasePohon: 'Fase Pohon',
      kodePohonPemupukan: 'Kode Pohon',
      jumlahBeratPupuk: '',
      deskripsiPemupukan: '',
    })

    const resetForm = () => {
      formState.value = {
        kodePohon: 'K001',
        deskripsiPenanaman: '',
        jumlahPemangkasan: '',
        deskripsiPemangkasan: '',
        jenisObat: 'Jenis Obat',
        kodePohonPerawatan: 'Kode Pohon',
        bagianPohon: 'Bagian Pohon',
        teknikPemberian: 'Teknik Pemberian Obat',
        namaObat: '',
        dosisObat: '',
        deskripsiPerawatan: '',
        jenisPupuk: 'Jenis Pupuk',
        fasePohon: 'Fase Pohon',
        kodePohonPemupukan: 'Kode Pohon',
        jumlahBeratPupuk: '',
        deskripsiPemupukan: '',
      }
    }

    watch(
      () => [props.selectedJenis, props.selectedRincian],
      () => {
        resetForm()
      },
      { immediate: true },
    )

    const canShowForm = computed(() => hasSelectedJenis() && hasSelectedRincian())

    const saveRecording = () => {
      if (!canShowForm.value) return
      alert('Catatan Perkebunan Berhasil Disimpan!')
      resetForm()
      emit('save')
    }

    return () => (
      <div class="perkebunan-recording-container">
        {/* Main Recording Selection Card */}
        <PerkebunanCardWrapper
          title="Pencatatan Perkebunan"
          subtitle=""
          metaLeft={formattedDate.value}
          metaRight={formattedTime.value}
        >
          <div style="margin-bottom: 0.5rem;">
            <span class="field-label" style="font-weight: 700; color: #111827; display: block; margin-bottom: 0.55rem;">Pencatatan</span>
            
            <PerkebunanSelectorCard
              label="Jenis Pencatatan"
              value={props.selectedJenis}
              iconSrc={getJenisIcon(props.selectedJenis)}
              onClick={() => emit('openJenis')}
            />

            <PerkebunanSelectorCard
              label="Rincian Pencatatan"
              value={props.selectedRincian}
              iconSrc={getJenisIcon(props.selectedJenis)}
              onClick={() => emit('openRincian')}
            />
          </div>
        </PerkebunanCardWrapper>

        {/* Dynamic Specific Form Card */}
        {canShowForm.value && (
          <PerkebunanCardWrapper
            title={kindTitle.value}
            subtitle={props.selectedJenis}
            metaRight={props.selectedRincian}
          >
            {kindTitle.value === 'Penanaman' && (
              <div class="form-body-wrap">
                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Lahan</span>
                  <div class="perkebunan-record-form-card" style="display: flex; align-items: center; gap: 0.85rem; border: 1.5px solid #cfd7bb; border-radius: 0.55rem; padding: 0.75rem; background: #ffffff;">
                    <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <img src="/icon/rumput.png" alt="Lahan" style="width: 1.3rem; height: 1.3rem;" />
                    </div>
                    <div>
                      <span style="font-size: 0.72rem; color: #6b7280; display: block;">Kode Lahan</span>
                      <strong style="font-size: 1rem; color: #111827;">L001</strong>
                    </div>
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Kode Pohon</span>
                  <PerkebunanFormSelect
                    modelValue={formState.value.kodePohon}
                    options={['K001', 'K002', 'K003', 'K004']}
                    placeholder="Kode Pohon"
                    onUpdate:modelValue={(val) => { formState.value.kodePohon = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1.25rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Deskripsi (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={formState.value.deskripsiPenanaman}
                    type="textarea"
                    placeholder="Masukkan deskripsi"
                    onUpdate:modelValue={(val) => { formState.value.deskripsiPenanaman = val }}
                  />
                </div>

                <button
                  class="btn-primary"
                  style="width: 100%; border-radius: 9999px; background: #38431f; font-weight: bold; cursor: pointer;"
                  onClick={saveRecording}
                >
                  Simpan
                </button>
              </div>
            )}

            {kindTitle.value === 'Pemberian Obat' && (
              <div class="form-body-wrap">
                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Obat</span>
                  <PerkebunanFormSelect
                    modelValue={formState.value.jenisObat}
                    options={['Fungisida', 'Pestisida', 'Nutrisi Daun']}
                    placeholder="Jenis Obat"
                    onUpdate:modelValue={(val) => { formState.value.jenisObat = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Kode Pohon</span>
                  <PerkebunanFormSelect
                    modelValue={formState.value.kodePohonPerawatan}
                    options={['K001', 'K002', 'K003']}
                    placeholder="Kode Pohon"
                    onUpdate:modelValue={(val) => { formState.value.kodePohonPerawatan = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Bagian Pohon</span>
                  <PerkebunanFormSelect
                    modelValue={formState.value.bagianPohon}
                    options={['Daun', 'Batang', 'Akar']}
                    placeholder="Bagian Pohon"
                    onUpdate:modelValue={(val) => { formState.value.bagianPohon = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Teknik Pemberian Obat</span>
                  <PerkebunanFormSelect
                    modelValue={formState.value.teknikPemberian}
                    options={['Semprot', 'Siram', 'Oles']}
                    placeholder="Teknik Pemberian Obat"
                    onUpdate:modelValue={(val) => { formState.value.teknikPemberian = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Nama Obat</span>
                  <PerkebunanFormInput
                    modelValue={formState.value.namaObat}
                    placeholder="Masukkan total berat pupuk"
                    onUpdate:modelValue={(val) => { formState.value.namaObat = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Dosis Obat (ML)</span>
                  <PerkebunanFormInput
                    modelValue={formState.value.dosisObat}
                    placeholder="Masukkan total berat pupuk"
                    onUpdate:modelValue={(val) => { formState.value.dosisObat = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1.25rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Deskripsi (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={formState.value.deskripsiPerawatan}
                    type="textarea"
                    placeholder="Masukkan deskripsi"
                    onUpdate:modelValue={(val) => { formState.value.deskripsiPerawatan = val }}
                  />
                </div>

                <button
                  class="btn-primary"
                  style="width: 100%; border-radius: 9999px; background: #38431f; font-weight: bold; cursor: pointer;"
                  onClick={saveRecording}
                >
                  Simpan
                </button>
              </div>
            )}

            {kindTitle.value === 'Pemangkasan' && (
              <div class="form-body-wrap">
                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jumlah Pemangkasan (Kg)</span>
                  <PerkebunanFormInput
                    modelValue={formState.value.jumlahPemangkasan}
                    placeholder="Masukkan berat pemangkasan"
                    onUpdate:modelValue={(val) => { formState.value.jumlahPemangkasan = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1.25rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Deskripsi (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={formState.value.deskripsiPemangkasan}
                    type="textarea"
                    placeholder="Masukkan deskripsi"
                    onUpdate:modelValue={(val) => { formState.value.deskripsiPemangkasan = val }}
                  />
                </div>

                <button
                  class="btn-primary"
                  style="width: 100%; border-radius: 9999px; background: #38431f; font-weight: bold; cursor: pointer;"
                  onClick={saveRecording}
                >
                  Simpan
                </button>
              </div>
            )}

            {kindTitle.value === 'Pemupukan' && (
              <div class="form-body-wrap">
                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Pupuk</span>
                  <PerkebunanFormSelect
                    modelValue={formState.value.jenisPupuk}
                    options={['Pupuk Cair', 'Pupuk Organik', 'Pupuk Kompos']}
                    placeholder="Jenis Pupuk"
                    onUpdate:modelValue={(val) => { formState.value.jenisPupuk = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Fase Pohon</span>
                  <PerkebunanFormSelect
                    modelValue={formState.value.fasePohon}
                    options={['Vegetatif', 'Generatif']}
                    placeholder="Fase Pohon"
                    onUpdate:modelValue={(val) => { formState.value.fasePohon = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Daftar Kode Pohon</span>
                  <PerkebunanFormSelect
                    modelValue={formState.value.kodePohonPemupukan}
                    options={['K001', 'K002', 'K003']}
                    placeholder="Kode Pohon"
                    onUpdate:modelValue={(val) => { formState.value.kodePohonPemupukan = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jumlah Berat Pupuk (Kg)</span>
                  <PerkebunanFormInput
                    modelValue={formState.value.jumlahBeratPupuk}
                    placeholder="Masukkan jumlah pohon"
                    onUpdate:modelValue={(val) => { formState.value.jumlahBeratPupuk = val }}
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1.25rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Deskripsi (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={formState.value.deskripsiPemupukan}
                    type="textarea"
                    placeholder="Masukkan deskripsi"
                    onUpdate:modelValue={(val) => { formState.value.deskripsiPemupukan = val }}
                  />
                </div>

                <button
                  class="btn-primary"
                  style="width: 100%; border-radius: 9999px; background: #38431f; font-weight: bold; cursor: pointer;"
                  onClick={saveRecording}
                >
                  Simpan
                </button>
              </div>
            )}
          </PerkebunanCardWrapper>
        )}
      </div>
    )
  },
})
