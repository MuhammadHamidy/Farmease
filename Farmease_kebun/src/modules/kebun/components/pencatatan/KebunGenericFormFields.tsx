import { defineComponent, type PropType, ref, watch } from 'vue'
import PerkebunanFormSelect from '../shared/PerkebunanFormSelect'
import PerkebunanFormInput from '../shared/PerkebunanFormInput'
import { perawatanApi } from '@/shared/api'

export default defineComponent({
  name: 'KebunGenericFormFields',
  props: {
    kindTitle: { type: String, required: true },
    form: { type: Object as PropType<any>, required: true },
    activeMode: { type: String as PropType<'lahan' | 'pohon'>, required: true },
    selectedRincian: { type: String, required: true },
    manureStock: { type: Number, default: 0 },
    selectedTreesCount: { type: Number, default: 1 },
    varietasOptions: { type: Array as PropType<string[]>, default: () => ['Semua Varietas'] },
    selectedVarietas: { type: String, default: 'Semua Varietas' },
    selectedTrees: { type: Array as PropType<string[]>, default: () => [] },
    allTrees: { type: Array as PropType<any[]>, default: () => [] },
  },
  emits: ['update:selectedVarietas'],
  setup(props, { emit }) {
    const f = () => props.form

    const rekomendasiText = ref('')

    const updateRekomendasi = async () => {
      // Resolve Varietas
      let resolvedVarietas = ''
      if (props.selectedVarietas && props.selectedVarietas !== 'Semua Varietas') {
        resolvedVarietas = props.selectedVarietas
      } else if (props.activeMode === 'pohon' && props.selectedTrees && props.selectedTrees.length > 0) {
        const firstTreeCode = props.selectedTrees[0]
        const tree = props.allTrees.find((t: any) => t.code === firstTreeCode)
        if (tree && tree.varietas) {
          resolvedVarietas = tree.varietas
        }
      }

      // Resolve Fase
      let resolvedFase = ''
      const fFase = f().fasePohon
      if (fFase && fFase !== 'Fase Pohon') {
        resolvedFase = fFase
      } else if (props.activeMode === 'pohon' && props.selectedTrees && props.selectedTrees.length > 0) {
        const firstTreeCode = props.selectedTrees[0]
        const tree = props.allTrees.find((t: any) => t.code === firstTreeCode)
        if (tree && tree.fase) {
          resolvedFase = tree.fase
        }
      }

      const obat = f().namaObat ? f().namaObat.trim() : ''

      if (!resolvedVarietas || !resolvedFase || !obat) {
        rekomendasiText.value = ''
        return
      }

      try {
        const text = await perawatanApi.getRekomendasi(resolvedVarietas, resolvedFase, obat)
        rekomendasiText.value = text
      } catch (err) {
        rekomendasiText.value = `Varietas <strong>${resolvedVarietas}</strong> dengan fase <strong>${resolvedFase}</strong> menggunakan <strong>${obat}</strong> dengan dosesi sebanyak <strong>2-3 mL/Liter air</strong>.`
      }
    }

    watch(
      () => [props.selectedVarietas, props.selectedTrees, f().fasePohon, f().namaObat, props.activeMode],
      () => {
        updateRekomendasi()
      },
      { immediate: true, deep: true }
    )

    return () => {
      const rincian = props.selectedRincian || 'Pencatatan'

      return (
        <div class="form-body-wrap" style="display: flex; flex-direction: column; gap: 1rem;">
          {/* Form Fields according to kindTitle */}
          {props.kindTitle === 'Penanaman' && (() => {
            const isPenggantian = props.selectedRincian.toLowerCase().includes('penggantian')
            return (
              <>
                {isPenggantian ? (
                  <>
                    {props.activeMode === 'lahan' && (
                      <div class="form-group">
                        <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Varietas</span>
                        <PerkebunanFormSelect
                          modelValue={props.selectedVarietas}
                          options={props.varietasOptions}
                          placeholder="Semua Varietas"
                          onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                        />
                      </div>
                    )}

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Kode Pohon (sesuai pohon dipilih)</span>
                      <PerkebunanFormInput
                        modelValue={f().kodePohonManual}
                        placeholder="Contoh: LA001"
                        onUpdate:modelValue={(val) => { f().kodePohonManual = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Penyebab Penggantian Pohon</span>
                      <PerkebunanFormInput
                        modelValue={f().deskripsiPenanaman}
                        placeholder="Contoh: Serangan hama"
                        onUpdate:modelValue={(val) => { f().deskripsiPenanaman = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                      <PerkebunanFormInput
                        modelValue={f().deskripsiPemangkasan}
                        type="textarea"
                        placeholder="Catatan"
                        onUpdate:modelValue={(val) => { f().deskripsiPemangkasan = val }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Varietas</span>
                      <PerkebunanFormSelect
                        modelValue={props.selectedVarietas}
                        options={props.varietasOptions}
                        placeholder="Semua Varietas"
                        onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Jenis Bibit</span>
                      <PerkebunanFormInput
                        modelValue={f().jenisBibit}
                        placeholder="Contoh: Okulasi"
                        onUpdate:modelValue={(val) => { f().jenisBibit = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Kode Pohon Baru</span>
                      <PerkebunanFormInput
                        modelValue={f().kodePohonManual}
                        placeholder="Contoh: 3"
                        onUpdate:modelValue={(val) => { f().kodePohonManual = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                      <PerkebunanFormInput
                        modelValue={f().deskripsiPenanaman}
                        type="textarea"
                        placeholder="Catatan"
                        onUpdate:modelValue={(val) => { f().deskripsiPenanaman = val }}
                      />
                    </div>
                  </>
                )}
              </>
            )
          })()}

          {props.kindTitle === 'Pemberian Obat' && (() => {
            return (
              <>
                {props.activeMode === 'lahan' && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Varietas</span>
                      <PerkebunanFormSelect
                        modelValue={props.selectedVarietas}
                        options={props.varietasOptions}
                        placeholder="Semua Varietas"
                        onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                      />
                    </div>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Fase Pohon</span>
                      <PerkebunanFormSelect
                        modelValue={f().fasePohon}
                        options={['Fase Pohon', 'Vegetatif', 'Generatif']}
                        placeholder="Fase Pohon"
                        onUpdate:modelValue={(val) => { f().fasePohon = val }}
                      />
                    </div>
                  </>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Nama Organisme Pengganggu Tumbuhan (OPT)</span>
                  <PerkebunanFormInput
                    modelValue={f().namaOPT}
                    placeholder="Contoh: Ulat Kipat, Lalat Buah, dll."
                    onUpdate:modelValue={(val) => { f().namaOPT = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Nama Obat</span>
                  <PerkebunanFormInput
                    modelValue={f().namaObat}
                    placeholder="Contoh: Ekstrak Nimba"
                    onUpdate:modelValue={(val) => { f().namaObat = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Volume Obat</span>
                  <PerkebunanFormInput
                    modelValue={f().volumeObat}
                    placeholder="Contoh: 20"
                    onUpdate:modelValue={(val) => { f().volumeObat = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Satuan Volume</span>
                  <PerkebunanFormSelect
                    modelValue={f().satuanVolumeObat}
                    options={['Mililiter (ml)', 'Liter (L)']}
                    placeholder="Satuan Volume"
                    onUpdate:modelValue={(val) => { f().satuanVolumeObat = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Teknik Pemberian Obat</span>
                  <PerkebunanFormSelect
                    modelValue={f().teknikPemberianObat}
                    options={['Semprot', 'Kocor', 'Siram', 'Oles']}
                    placeholder="Teknik Pemberian Obat"
                    onUpdate:modelValue={(val) => { f().teknikPemberianObat = val }}
                  />
                </div>

                {rekomendasiText.value && (
                  <div style="background-color: #fdf7e7; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 1rem; margin-top: 0.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                      <div style="display: flex; align-items: center; justify-content: center; width: 2.25rem; height: 2.25rem; background-color: #2e3b1f; border-radius: 50%; color: #ffffff; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1.1rem; height: 1.1rem; color: #fff8e7;">
                          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/>
                          <line x1="9" y1="18" x2="15" y2="18"/>
                          <line x1="10" y1="22" x2="14" y2="22"/>
                        </svg>
                      </div>
                      <div>
                        <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 800; color: #2e3b1f; text-align: left;">Rekomendasi Pemberian Obat</h4>
                        <p innerHTML={rekomendasiText.value} style="margin: 0; font-size: 0.85rem; color: #4e5a3e; line-height: 1.45; font-weight: 600; text-align: left;"></p>
                      </div>
                    </div>
                  </div>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Volume Larutan</span>
                  <PerkebunanFormInput
                    modelValue={f().volumeLarutan}
                    placeholder="Contoh: 20"
                    onUpdate:modelValue={(val) => { f().volumeLarutan = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Satuan Volume</span>
                  <PerkebunanFormSelect
                    modelValue={f().satuanVolumeLarutan}
                    options={['Mililiter (ml)', 'Liter (L)']}
                    placeholder="Satuan Volume"
                    onUpdate:modelValue={(val) => { f().satuanVolumeLarutan = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().deskripsiPerawatan}
                    type="textarea"
                    placeholder="Catatan"
                    onUpdate:modelValue={(val) => { f().deskripsiPerawatan = val }}
                  />
                </div>
              </>
            )
          })()}

          {props.kindTitle === 'Pemangkasan' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Metode Pemangkasan</span>
                <PerkebunanFormSelect
                  modelValue={f().metodePemangkasan}
                  options={['Pemangkasan Bentuk', 'Pemangkasan Produksi', 'Pemangkasan Peremajaan']}
                  placeholder="Metode Pemangkasan"
                  onUpdate:modelValue={(val) => { f().metodePemangkasan = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Total Pemangkasan (Kg)</span>
                <PerkebunanFormInput
                  modelValue={f().jumlahPemangkasan}
                  placeholder="Contoh: 15"
                  onUpdate:modelValue={(val) => { f().jumlahPemangkasan = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Tujuan Pemanfaatan</span>
                <PerkebunanFormSelect
                  modelValue={f().tujuanPemanfaatan}
                  options={['Pakan Ternak', 'Kompos', 'Dibuang']}
                  placeholder="Pemanfaatan"
                  onUpdate:modelValue={(val) => { f().tujuanPemanfaatan = val }}
                />
              </div>

              {Number(f().jumlahPemangkasan) > 0 && f().tujuanPemanfaatan !== 'Dibuang' && (
                <div style="background-color: #f6f8ee; border: 1px solid #dce1d0; border-radius: 0.5rem; padding: 1rem; margin-top: 0.5rem;">
                  <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                    <span style="font-size: 1.25rem;">💡</span>
                    <div>
                      <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 800; color: #2f3b1d;">Prediksi Sirkular Ekosistem</h4>
                      <p style="margin: 0; font-size: 0.85rem; color: #4f5d2e; line-height: 1.4; font-weight: 600;">
                        {f().tujuanPemanfaatan === 'Kompos' 
                          ? `Limbah pangkasan seberat ${f().jumlahPemangkasan} Kg diprediksi akan menghasilkan ${(Number(f().jumlahPemangkasan) * 0.5).toFixed(1)} Kg stok pupuk organik (asumsi rasio kompos 50%).`
                          : `Limbah pangkasan seberat ${f().jumlahPemangkasan} Kg akan dikirim ke Peternakan dan berpotensi menjadi pakan hijauan bernutrisi bagi domba.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPemangkasan}
                  type="textarea"
                  placeholder="Contoh: kendala, kondisi dan lain lain"
                  onUpdate:modelValue={(val) => { f().deskripsiPemangkasan = val }}
                />
              </div>
            </>
          )}

          {props.kindTitle === 'Pemupukan' && (() => {
            const isCair = rincian.toLowerCase().includes('cair')
            const isOrganik = rincian.toLowerCase().includes('organik')
            let volumeLabel = 'Dosis Pupuk (Gram)'
            if (isCair) {
              volumeLabel = 'Volume Pupuk (Liter)'
            } else if (isOrganik) {
              volumeLabel = 'Jumlah Pupuk Dipakai (Kilogram)'
            }
            const volumePlaceholder = 'Contoh: 2'

            return (
              <>
                {!isOrganik && (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Jenis {rincian}</span>
                    <PerkebunanFormSelect
                      modelValue={f().jenisPupukDetail}
                      options={isCair ? ['Pupuk NPK Cair', 'Pupuk Organik Cair', 'Pupuk Kocor Asam Amino'] : ['Pupuk Kandang', 'Pupuk Kompos Padat', 'Pupuk Urea Granul']}
                      placeholder={`Jenis ${rincian}`}
                      onUpdate:modelValue={(val) => { f().jenisPupukDetail = val }}
                    />
                  </div>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Teknik Pemupukan</span>
                  <PerkebunanFormSelect
                    modelValue={f().teknikPemupukan}
                    options={['Semprot', 'Kocor', 'Tebar', 'Tugal']}
                    placeholder="Teknik Pemupukan"
                    onUpdate:modelValue={(val) => { f().teknikPemupukan = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">{volumeLabel}</span>
                  <PerkebunanFormInput
                    modelValue={f().jumlahBeratPupuk}
                    placeholder={volumePlaceholder}
                    onUpdate:modelValue={(val) => { f().jumlahBeratPupuk = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().deskripsiPemupukan}
                    type="textarea"
                    placeholder="Contoh: kendala, kondisi dan lain lain"
                    onUpdate:modelValue={(val) => { f().deskripsiPemupukan = val }}
                  />
                </div>

                {isOrganik && Number(f().jumlahBeratPupuk) > 0 && (
                  <div style={`background-color: ${Number(f().jumlahBeratPupuk) > props.manureStock ? '#fff5f5' : '#f6f8ee'}; border: 1px solid ${Number(f().jumlahBeratPupuk) > props.manureStock ? '#ffe3e3' : '#dce1d0'}; border-radius: 0.5rem; padding: 1rem; margin-top: 0.5rem;`}>
                    <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                      <span style="font-size: 1.25rem;">{Number(f().jumlahBeratPupuk) > props.manureStock ? '⚠️' : '💡'}</span>
                      <div>
                        <h4 style={`margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 800; color: ${Number(f().jumlahBeratPupuk) > props.manureStock ? '#e03131' : '#2f3b1d'};`}>
                          {Number(f().jumlahBeratPupuk) > props.manureStock ? 'Peringatan Stok Kurang' : 'Prediksi Dosis Pemupukan'}
                        </h4>
                        <p style={`margin: 0; font-size: 0.85rem; font-weight: 600; color: ${Number(f().jumlahBeratPupuk) > props.manureStock ? '#c92a2a' : '#4f5d2e'}; line-height: 1.4;`}>
                          {Number(f().jumlahBeratPupuk) > props.manureStock 
                            ? `Jumlah yang Anda masukkan (${f().jumlahBeratPupuk} Kg) melebihi stok kotoran domba dari peternakan yang tersedia saat ini (${props.manureStock.toFixed(1)} Kg).`
                            : props.activeMode === 'pohon'
                              ? `Dengan total ${f().jumlahBeratPupuk} Kg untuk ${props.selectedTreesCount} pohon, maka setiap pohon akan mendapatkan dosis ${(Number(f().jumlahBeratPupuk) / props.selectedTreesCount).toFixed(2)} Kg/pohon.`
                              : `Anda menggunakan ${f().jumlahBeratPupuk} Kg dari stok pupuk organik (${props.manureStock.toFixed(1)} Kg) untuk seluruh lahan.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          })()}

          {props.kindTitle === 'Pembersihan' && (() => {
            const isPenyiangan = rincian === 'Penyiangan Gulma'
            const isPembumbunan = rincian === 'Pembumbunan Tanah'
            const isSanitasi = rincian === 'Sanitasi Serasah & Ranting'

            return (
              <>
                {props.activeMode === 'lahan' && (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Varietas</span>
                    <PerkebunanFormSelect
                      modelValue={props.selectedVarietas}
                      options={props.varietasOptions}
                      placeholder="Semua Varietas"
                      onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                    />
                  </div>
                )}

                {isPenyiangan && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Alat Pembersihan</span>
                      <PerkebunanFormSelect
                        modelValue={f().alatPembersihan}
                        options={['Manual', 'Cangkul', 'Sarit', 'Mesin Potong Rumput']}
                        placeholder="Alat Pembersihan"
                        onUpdate:modelValue={(val) => { f().alatPembersihan = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Jenis Gulma</span>
                      <PerkebunanFormSelect
                        modelValue={f().jenisGulma}
                        options={['Tekian', 'Rerumputan', 'Gulma Daun Lebar', 'Lainnya']}
                        placeholder="Jenis Gulma"
                        onUpdate:modelValue={(val) => { f().jenisGulma = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Total Berat Gulma</span>
                      <PerkebunanFormInput
                        modelValue={f().beratGulma}
                        placeholder="Catatan"
                        onUpdate:modelValue={(val) => { f().beratGulma = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Satuan Berat</span>
                      <PerkebunanFormSelect
                        modelValue={f().satuanBerat}
                        options={['Kilogram (Kg)', 'Gram (g)']}
                        placeholder="Satuan Berat"
                        onUpdate:modelValue={(val) => { f().satuanBerat = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Pemanfaatan</span>
                      <PerkebunanFormSelect
                        modelValue={f().tujuanPemanfaatan}
                        options={['Pakan Ternak', 'Kompos', 'Dibuang']}
                        placeholder="Pemanfaatan"
                        onUpdate:modelValue={(val) => { f().tujuanPemanfaatan = val }}
                      />
                    </div>
                  </>
                )}

                {isPembumbunan && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Bahan Pembumbun</span>
                      <PerkebunanFormSelect
                        modelValue={f().bahanPembumbun}
                        options={['Tanah Humus', 'Tanah Kompos', 'Tanah Galian Lahan']}
                        placeholder="Bahan Pembumbunan"
                        onUpdate:modelValue={(val) => { f().bahanPembumbun = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Total Berat Bahan Pembumbun</span>
                      <PerkebunanFormInput
                        modelValue={f().beratBahanPembumbun}
                        placeholder="Catatan"
                        onUpdate:modelValue={(val) => { f().beratBahanPembumbun = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Satuan Berat</span>
                      <PerkebunanFormSelect
                        modelValue={f().satuanBerat}
                        options={['Kilogram (Kg)', 'Gram (g)']}
                        placeholder="Satuan Berat"
                        onUpdate:modelValue={(val) => { f().satuanBerat = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Pemanfaatan</span>
                      <PerkebunanFormSelect
                        modelValue={f().tujuanPemanfaatan}
                        options={['Pakan Ternak', 'Kompos', 'Dibuang']}
                        placeholder="Pemanfaatan"
                        onUpdate:modelValue={(val) => { f().tujuanPemanfaatan = val }}
                      />
                    </div>
                  </>
                )}

                {isSanitasi && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Bagian Pembersihan</span>
                      <PerkebunanFormSelect
                        modelValue={f().bagianPembersihan}
                        options={['Serasah Daun', 'Ranting/Cabang Mati', 'Batang Pohon', 'Lainnya']}
                        placeholder="Bagian Pembersihan"
                        onUpdate:modelValue={(val) => { f().bagianPembersihan = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Total Berat</span>
                      <PerkebunanFormInput
                        modelValue={f().beratLimbah}
                        placeholder="Catatan"
                        onUpdate:modelValue={(val) => { f().beratLimbah = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Satuan Berat</span>
                      <PerkebunanFormSelect
                        modelValue={f().satuanBerat}
                        options={['Kilogram (Kg)', 'Gram (g)']}
                        placeholder="Satuan Berat"
                        onUpdate:modelValue={(val) => { f().satuanBerat = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Pemanfaatan</span>
                      <PerkebunanFormSelect
                        modelValue={f().tujuanPemanfaatan}
                        options={['Pakan Ternak', 'Kompos', 'Dibuang']}
                        placeholder="Pemanfaatan"
                        onUpdate:modelValue={(val) => { f().tujuanPemanfaatan = val }}
                      />
                    </div>
                  </>
                )}

                {!isPenyiangan && !isPembumbunan && !isSanitasi && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Limbah</span>
                      <PerkebunanFormSelect
                        modelValue={f().jenisLimbah}
                        options={['Guguran Daun', 'Ranting Kering', 'Rumput Liar (Gulma)', 'Limbah Buah Busuk']}
                        placeholder="Jenis Limbah"
                        onUpdate:modelValue={(val) => { f().jenisLimbah = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Total Berat Limbah (Kg)</span>
                      <PerkebunanFormInput
                        modelValue={f().beratLimbah}
                        placeholder="Contoh: 2"
                        onUpdate:modelValue={(val) => { f().beratLimbah = val }}
                      />
                    </div>
                  </>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().deskripsiPembersihan}
                    type="textarea"
                    placeholder="Catatan"
                    onUpdate:modelValue={(val) => { f().deskripsiPembersihan = val }}
                  />
                </div>
              </>
            )
          })()}

          {props.kindTitle === 'Pembuahan' && (() => {
            const r = rincian.toLowerCase()
            const isMerangsang = r.includes('merangsang') || r.includes('perangsang')
            const isPenjarangan = r.includes('penjarangan')
            const isPembungkusan = r.includes('pembungkusan')

            if (isMerangsang) {
              return (
                <>
                  <div class="form-group">
                    <span class="field-label">Pilih Metode Perlakuan</span>
                    <PerkebunanFormSelect
                      modelValue={f().metodePerlakuan}
                      options={['Semprot Daun', 'Kocor Akar', 'Oles Batang', 'Foliar Spray']}
                      placeholder="Metode Perlakuan"
                      onUpdate:modelValue={(val) => { f().metodePerlakuan = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Masukkan Jenis Hormon (Opsional)</span>
                    <PerkebunanFormInput
                      modelValue={f().jenisHormon}
                      placeholder="Contoh: ZPT"
                      onUpdate:modelValue={(val) => { f().jenisHormon = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Catatan (Opsional)</span>
                    <PerkebunanFormInput
                      modelValue={f().deskripsiPembuahan}
                      type="textarea"
                      placeholder="Catatan"
                      onUpdate:modelValue={(val) => { f().deskripsiPembuahan = val }}
                    />
                  </div>
                </>
              )
            }

            if (isPenjarangan) {
              return (
                <>
                  <div class="form-group">
                    <span class="field-label">Diameter Buah Saat Dijarangkan</span>
                    <PerkebunanFormInput
                      modelValue={f().diameterBuah}
                      type="number"
                      placeholder="Contoh: 3"
                      onUpdate:modelValue={(val) => { f().diameterBuah = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Pilih Satuan Diameter</span>
                    <PerkebunanFormSelect
                      modelValue={f().satuanDiameter}
                      options={['Centimeter (cm)', 'Milimeter (mm)']}
                      placeholder="Satuan Diameter"
                      onUpdate:modelValue={(val) => { f().satuanDiameter = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Masukkan Jumlah Buah Dibuang</span>
                    <PerkebunanFormInput
                      modelValue={f().jumlahBuahDibuang}
                      type="number"
                      placeholder="Contoh: 3"
                      onUpdate:modelValue={(val) => { f().jumlahBuahDibuang = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Masukkan Sisa Buah per Tandan</span>
                    <PerkebunanFormInput
                      modelValue={f().sisaBuahPerTandan}
                      type="number"
                      placeholder="Contoh: 3"
                      onUpdate:modelValue={(val) => { f().sisaBuahPerTandan = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Catatan (Opsional)</span>
                    <PerkebunanFormInput
                      modelValue={f().deskripsiPembuahan}
                      type="textarea"
                      placeholder="Catatan"
                      onUpdate:modelValue={(val) => { f().deskripsiPembuahan = val }}
                    />
                  </div>
                </>
              )
            }

            if (isPembungkusan) {
              return (
                <>
                  <div class="form-group">
                    <span class="field-label">Pilih Bahan Pembungkus</span>
                    <PerkebunanFormSelect
                      modelValue={f().bahanPembungkus}
                      options={['Kantong Kertas', 'Kantong Plastik', 'Sarung Buah', 'Net Bag']}
                      placeholder="Bahan Pembungkus"
                      onUpdate:modelValue={(val) => { f().bahanPembungkus = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Masukkan Jumlah Buah / Malai yang Dibungkus</span>
                    <PerkebunanFormInput
                      modelValue={f().jumlahBuahDibungkus}
                      type="number"
                      placeholder="Contoh: 3"
                      onUpdate:modelValue={(val) => { f().jumlahBuahDibungkus = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Catatan (Opsional)</span>
                    <PerkebunanFormInput
                      modelValue={f().deskripsiPembuahan}
                      type="textarea"
                      placeholder="Catatan"
                      onUpdate:modelValue={(val) => { f().deskripsiPembuahan = val }}
                    />
                  </div>
                </>
              )
            }

            return null
          })()}

          {props.kindTitle === 'Panen' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Kondisi Panen</span>
                <PerkebunanFormSelect
                  modelValue={f().kondisiPanen}
                  options={['Matang Optimal', 'Terlalu Matang', 'Kurang Matang', 'Cacat / Rusak']}
                  placeholder="Kondisi Panen"
                  onUpdate:modelValue={(val) => { f().kondisiPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Cara Panen</span>
                <PerkebunanFormSelect
                  modelValue={f().caraPanen}
                  options={['Petik Manual', 'Petik dengan Galah', 'Jaring Bawah', 'Gunting Panen']}
                  placeholder="Cara Panen"
                  onUpdate:modelValue={(val) => { f().caraPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Jumlah Buah</span>
                <PerkebunanFormInput
                  modelValue={f().jumlahPanen}
                  placeholder="Contoh: 15"
                  onUpdate:modelValue={(val) => { f().jumlahPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Total Berat Buah</span>
                <PerkebunanFormInput
                  modelValue={f().beratPanen}
                  placeholder="Contoh: 2"
                  onUpdate:modelValue={(val) => { f().beratPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Satuan Berat</span>
                <PerkebunanFormSelect
                  modelValue={f().satuanBerat}
                  options={['Kilogram (Kg)', 'Gram (g)', 'Ton']}
                  placeholder="Satuan Berat"
                  onUpdate:modelValue={(val) => { f().satuanBerat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPanen}
                  type="textarea"
                  placeholder="Catatan"
                  onUpdate:modelValue={(val) => { f().deskripsiPanen = val }}
                />
              </div>
            </>
          )}
          {props.kindTitle === 'Penyiraman' && (
            <>
              {props.activeMode === 'lahan' && (
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Varietas</span>
                  <PerkebunanFormSelect
                    modelValue={props.selectedVarietas}
                    options={props.varietasOptions}
                    placeholder="Semua Varietas"
                    onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                  />
                </div>
              )}

              {props.selectedRincian === 'Biopori' && (
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Jumlah Lubang Biopori</span>
                  <PerkebunanFormInput
                    modelValue={f().jumlahLubangBiopori}
                    placeholder="Contoh: 1"
                    onUpdate:modelValue={(val) => { f().jumlahLubangBiopori = val }}
                  />
                </div>
              )}

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Volume Air</span>
                <PerkebunanFormInput
                  modelValue={f().volumeAir}
                  placeholder="Contoh: 15"
                  onUpdate:modelValue={(val) => { f().volumeAir = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Satuan Volume</span>
                <PerkebunanFormSelect
                  modelValue={f().satuanVolumeAir}
                  options={['Liter (L)', 'Mililiter (ml)']}
                  placeholder="Satuan Volume"
                  onUpdate:modelValue={(val) => { f().satuanVolumeAir = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Sesi Penyiraman</span>
                <PerkebunanFormSelect
                  modelValue={f().sesiPenyiraman}
                  options={['Semua Sesi', 'Pagi', 'Siang', 'Sore']}
                  placeholder="Sesi Penyiraman"
                  onUpdate:modelValue={(val) => { f().sesiPenyiraman = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPenyiraman}
                  type="textarea"
                  placeholder="Catatan"
                  onUpdate:modelValue={(val) => { f().deskripsiPenyiraman = val }}
                />
              </div>
            </>
          )}

          {props.kindTitle === 'Stok Obat' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Jenis Obat</span>
                <PerkebunanFormSelect
                  modelValue={f().jenisObat}
                  options={['Pestisida', 'Insektisida', 'Fungisida']}
                  placeholder="Jenis Obat"
                  onUpdate:modelValue={(val) => { f().jenisObat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Nama Obat</span>
                <PerkebunanFormInput
                  modelValue={f().namaObat}
                  placeholder="Contoh: Ekstrak Nimba"
                  onUpdate:modelValue={(val) => { f().namaObat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Jumlah Stok Obat</span>
                <PerkebunanFormInput
                  modelValue={f().volumeObat}
                  placeholder="Contoh: 2"
                  onUpdate:modelValue={(val) => { f().volumeObat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Satuan</span>
                <PerkebunanFormSelect
                  modelValue={f().satuanVolumeObat}
                  options={['Mililiter (ml)', 'Gram (g)', 'Liter (L)', 'Kilogram (Kg)']}
                  placeholder="Satuan"
                  onUpdate:modelValue={(val) => { f().satuanVolumeObat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Teknik Pemberian Obat</span>
                <PerkebunanFormSelect
                  modelValue={f().teknikPemberianObat}
                  options={['Semprot', 'Kocor', 'Siram', 'Oles']}
                  placeholder="Teknik Pemberian Obat"
                  onUpdate:modelValue={(val) => { f().teknikPemberianObat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Volume Larutan</span>
                <PerkebunanFormInput
                  modelValue={f().volumeLarutan}
                  placeholder="Contoh: 20"
                  onUpdate:modelValue={(val) => { f().volumeLarutan = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Tanggal Kadaluarsa</span>
                <PerkebunanFormInput
                  modelValue={f().tanggalKadaluarsa}
                  type="date"
                  placeholder="mm/dd/yyyy"
                  onUpdate:modelValue={(val) => { f().tanggalKadaluarsa = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().catatanStok}
                  type="textarea"
                  placeholder="Catatan"
                  onUpdate:modelValue={(val) => { f().catatanStok = val }}
                />
              </div>
            </>
          )}

          {props.kindTitle === 'Stok Pupuk' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Jenis Pupuk</span>
                <PerkebunanFormSelect
                  modelValue={f().jenisPupuk}
                  options={['Pupuk Organik Cair', 'Pupuk Organik Padat', 'Pupuk Kimia']}
                  placeholder="Jenis Pupuk"
                  onUpdate:modelValue={(val) => { f().jenisPupuk = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Nama Pupuk</span>
                <PerkebunanFormInput
                  modelValue={f().namaObat}
                  placeholder="Contoh: Pupuk Kandang"
                  onUpdate:modelValue={(val) => { f().namaObat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Jumlah Stok Pupuk</span>
                <PerkebunanFormInput
                  modelValue={f().volumeObat}
                  placeholder="Contoh: 2"
                  onUpdate:modelValue={(val) => { f().volumeObat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Satuan</span>
                <PerkebunanFormSelect
                  modelValue={f().satuanVolumeObat}
                  options={['Mililiter (ml)', 'Gram (g)', 'Liter (L)', 'Kilogram (Kg)']}
                  placeholder="Satuan"
                  onUpdate:modelValue={(val) => { f().satuanVolumeObat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Teknik Pemupukan</span>
                <PerkebunanFormSelect
                  modelValue={f().teknikPemberianObat}
                  options={['Semprot', 'Kocor', 'Tebar', 'Tugal']}
                  placeholder="Teknik Pemupukan"
                  onUpdate:modelValue={(val) => { f().teknikPemberianObat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Volume Larutan</span>
                <PerkebunanFormInput
                  modelValue={f().volumeLarutan}
                  placeholder="Contoh: 20"
                  onUpdate:modelValue={(val) => { f().volumeLarutan = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Tanggal Kadaluarsa</span>
                <PerkebunanFormInput
                  modelValue={f().tanggalKadaluarsa}
                  type="date"
                  placeholder="mm/dd/yyyy"
                  onUpdate:modelValue={(val) => { f().tanggalKadaluarsa = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().catatanStok}
                  type="textarea"
                  placeholder="Catatan"
                  onUpdate:modelValue={(val) => { f().catatanStok = val }}
                />
              </div>
            </>
          )}

          {props.kindTitle === 'Stok Pakan' && (() => {
            const isMasuk = rincian.includes('Masuk') || rincian.includes('Tambah')
            return (
              <>
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                    {isMasuk ? 'Jumlah Masuk (Kg)' : 'Jumlah Keluar (Kg)'}
                  </span>
                  <PerkebunanFormInput
                    modelValue={isMasuk ? f().jumlahStokMasuk : f().jumlahStokKeluar}
                    placeholder="Contoh: 50"
                    type="number"
                    onUpdate:modelValue={(val) => { 
                      if (isMasuk) f().jumlahStokMasuk = val;
                      else f().jumlahStokKeluar = val;
                    }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().catatanStok}
                    type="textarea"
                    placeholder="Contoh: Dari Supplier A"
                    onUpdate:modelValue={(val) => { f().catatanStok = val }}
                  />
                </div>
              </>
            )
          })()}
        </div>
      )
    }
  }
})
