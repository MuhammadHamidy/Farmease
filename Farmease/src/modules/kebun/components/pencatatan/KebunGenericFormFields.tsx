import { defineComponent, type PropType } from 'vue'
import PerkebunanFormSelect from '../shared/PerkebunanFormSelect'
import PerkebunanFormInput from '../shared/PerkebunanFormInput'

export default defineComponent({
  name: 'KebunGenericFormFields',
  props: {
    kindTitle: { type: String, required: true },
    form: { type: Object as PropType<any>, required: true },
    activeMode: { type: String as PropType<'lahan' | 'pohon'>, required: true },
    selectedRincian: { type: String, required: true },
  },
  setup(props) {
    const f = () => props.form

    return () => {
      const rincian = props.selectedRincian || 'Pencatatan'

      return (
        <div class="form-body-wrap" style="display: flex; flex-direction: column; gap: 1rem;">
          {/* Form Fields according to kindTitle */}
          {props.kindTitle === 'Penanaman' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Alasan Penanaman</span>
                <PerkebunanFormSelect
                  modelValue={f().alasanPenanaman}
                  options={['Bibit Baru', 'Sulam Mati', 'Perluasan Lahan']}
                  placeholder="Alasan Penanaman"
                  onUpdate:modelValue={(val) => { f().alasanPenanaman = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Kode Pohon</span>
                <PerkebunanFormInput
                  modelValue={f().kodePohonManual}
                  placeholder="Contoh: LA001"
                  onUpdate:modelValue={(val) => { f().kodePohonManual = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPenanaman}
                  type="textarea"
                  placeholder="Contoh: kendala, kondisi dan lain lain"
                  onUpdate:modelValue={(val) => { f().deskripsiPenanaman = val }}
                />
              </div>
            </>
          )}

          {props.kindTitle === 'Pemberian Obat' && (() => {
            const isFungisida = rincian.toLowerCase().includes('fungisida')
            const isPestisida = rincian.toLowerCase().includes('pestisida')
            const isInsektisida = rincian.toLowerCase().includes('insektisida')

            // Dynamic Name Placeholder
            let namePlaceholder = 'Masukkan nama obat'
            if (isFungisida) namePlaceholder = 'Contoh: Dithane M-45'
            else if (isPestisida) namePlaceholder = 'Contoh: Dursban, Decis, dll'
            else if (isInsektisida) namePlaceholder = 'Contoh: Regent, Confidor, dll'

            // Dynamic Dosis Label
            const dosisLabel = isFungisida ? `Dosis ${rincian} (Mililiter)` : `Dosis Pestisida (Mililiter)`

            return (
              <>
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Teknik Pengendalian</span>
                  <PerkebunanFormSelect
                    modelValue={f().teknikPengendalian}
                    options={['Semprot', 'Kocor', 'Siram', 'Oles']}
                    placeholder="Teknik Pengendalian"
                    onUpdate:modelValue={(val) => { f().teknikPengendalian = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Nama {rincian}</span>
                  <PerkebunanFormInput
                    modelValue={f().namaPestisida}
                    placeholder={namePlaceholder}
                    onUpdate:modelValue={(val) => { f().namaPestisida = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">{dosisLabel}</span>
                  <PerkebunanFormInput
                    modelValue={f().dosisPestisida}
                    placeholder="Contoh: 2"
                    onUpdate:modelValue={(val) => { f().dosisPestisida = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Volume air (Liter)</span>
                  <PerkebunanFormInput
                    modelValue={f().volumeAir}
                    placeholder="Contoh: 2"
                    onUpdate:modelValue={(val) => { f().volumeAir = val }}
                  />
                </div>

                {isFungisida ? (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Nama Gejala Penyakit</span>
                    <PerkebunanFormInput
                      modelValue={f().namaGejala}
                      placeholder="Contoh: Bercak daun"
                      onUpdate:modelValue={(val) => { f().namaGejala = val }}
                    />
                  </div>
                ) : (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Target Hama</span>
                    <PerkebunanFormInput
                      modelValue={f().targetHama}
                      placeholder={isInsektisida ? 'Contoh: Wereng, Thrips, dll' : 'Contoh: Kutu, Ulat, dll'}
                      onUpdate:modelValue={(val) => { f().targetHama = val }}
                    />
                  </div>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().deskripsiPerawatan}
                    type="textarea"
                    placeholder="Contoh: kendala, kondisi dan lain lain"
                    onUpdate:modelValue={(val) => { f().deskripsiPerawatan = val }}
                  />
                </div>
              </>
            )
          })()}

          {props.kindTitle === 'Pemangkasan' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Fase Pohon</span>
                <PerkebunanFormSelect
                  modelValue={f().fasePohon}
                  options={['Generatif', 'Vegetatif']}
                  placeholder="Fase Pohon"
                  onUpdate:modelValue={(val) => { f().fasePohon = val }}
                />
              </div>

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
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Fase Pohon</span>
                  <PerkebunanFormSelect
                    modelValue={f().fasePohon}
                    options={['Generatif', 'Vegetatif']}
                    placeholder="Fase Pohon"
                    onUpdate:modelValue={(val) => { f().fasePohon = val }}
                  />
                </div>

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
              </>
            )
          })()}

          {props.kindTitle === 'Pembersihan' && (() => {
            const isRumputLiar = rincian.toLowerCase().includes('rumput')
            const catatanPlaceholder = isRumputLiar
              ? 'Contoh: kondisi rumput'
              : 'Contoh: kendala, kondisi dan lain lain'

            return (
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

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().deskripsiPembersihan}
                    type="textarea"
                    placeholder={catatanPlaceholder}
                    onUpdate:modelValue={(val) => { f().deskripsiPembersihan = val }}
                  />
                </div>
              </>
            )
          })()}

          {props.kindTitle === 'Pembuahan' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Perangsang</span>
                <PerkebunanFormSelect
                  modelValue={f().jenisPerangsang}
                  options={['Paklobutrazol', 'ZPT', 'Giberelin (GA3)']}
                  placeholder="Jenis Perangsang"
                  onUpdate:modelValue={(val) => { f().jenisPerangsang = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Dosis Perangsang (gram)</span>
                <PerkebunanFormInput
                  modelValue={f().dosisPerangsang}
                  placeholder="Contoh: 2"
                  onUpdate:modelValue={(val) => { f().dosisPerangsang = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPembuahan}
                  type="textarea"
                  placeholder="Contoh: kendala, kondisi dan lain lain"
                  onUpdate:modelValue={(val) => { f().deskripsiPembuahan = val }}
                />
              </div>
            </>
          )}

          {props.kindTitle === 'Panen' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Total Panen (Buah)</span>
                <PerkebunanFormInput
                  modelValue={f().jumlahPanen}
                  placeholder="Contoh: 15"
                  onUpdate:modelValue={(val) => { f().jumlahPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Total Berat Panen (Kg)</span>
                <PerkebunanFormInput
                  modelValue={f().beratPanen}
                  placeholder="Contoh: 2"
                  onUpdate:modelValue={(val) => { f().beratPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPanen}
                  type="textarea"
                  placeholder="Contoh: kendala, kondisi dan lain lain"
                  onUpdate:modelValue={(val) => { f().deskripsiPanen = val }}
                />
              </div>
            </>
          )}
        </div>
      )
    }
  }
})
