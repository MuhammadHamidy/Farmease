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
    manureStock: { type: Number, default: 0 },
    selectedTreesCount: { type: Number, default: 1 },
    varietasOptions: { type: Array as PropType<string[]>, default: () => ['Semua Varietas'] },
    selectedVarietas: { type: String, default: 'Semua Varietas' },
  },
  emits: ['update:selectedVarietas'],
  setup(props, { emit }) {
    const f = () => props.form

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
              </>
            )
          })()}

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
                    <span class="field-label">Jenis Hormon (Opsional)</span>
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
                    <span class="field-label">Jumlah Buah Dibuang</span>
                    <PerkebunanFormInput
                      modelValue={f().jumlahBuahDibuang}
                      type="number"
                      placeholder="Contoh: 3"
                      onUpdate:modelValue={(val) => { f().jumlahBuahDibuang = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Sisa Buah per Tandan</span>
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
                    <span class="field-label">Jumlah Buah / Malai yang Dibungkus</span>
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
                  placeholder="Contoh: kendala, kondisi dan lain lain"
                  onUpdate:modelValue={(val) => { f().deskripsiPanen = val }}
                />
              </div>
            </>
          )}

          {props.kindTitle === 'Penyiraman' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Teknik Penyiraman</span>
                <PerkebunanFormSelect
                  modelValue={f().teknikPenyiraman}
                  options={['Manual', 'Irigasi Tetes', 'Sprinkler']}
                  placeholder="Teknik Penyiraman"
                  onUpdate:modelValue={(val) => { f().teknikPenyiraman = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Sesi Penyiraman</span>
                <PerkebunanFormSelect
                  modelValue={f().sesiPenyiraman}
                  options={['Pagi', 'Siang', 'Sore']}
                  placeholder="Sesi Penyiraman"
                  onUpdate:modelValue={(val) => { f().sesiPenyiraman = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPenyiraman}
                  type="textarea"
                  placeholder="Contoh: kendala, kondisi dan lain lain"
                  onUpdate:modelValue={(val) => { f().deskripsiPenyiraman = val }}
                />
              </div>
            </>
          )}

          {(props.kindTitle === 'Stok Pakan' || props.kindTitle === 'Stok Pupuk' || props.kindTitle === 'Stok Obat') && (() => {
            const isMasuk = rincian.includes('Masuk') || rincian.includes('Tambah') || rincian.includes('Obat')
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
