import { defineComponent, type PropType } from 'vue'
import PerkebunanFormSelect from '../shared/PerkebunanFormSelect'
import PerkebunanFormInput from '../shared/PerkebunanFormInput'

export default defineComponent({
  name: 'KebunGenericFormFields',
  props: {
    kindTitle: { type: String, required: true },
    form: { type: Object as PropType<any>, required: true },
    activeMode: { type: String as PropType<'lahan' | 'pohon'>, required: true },
  },
  setup(props) {
    const f = () => props.form

    return () => (
      <div class="form-body-wrap">
        {/* Form Fields according to kindTitle */}
        {props.kindTitle === 'Penanaman' && (
          <>
            {props.activeMode === 'pohon' ? (
              <div class="form-group" style="margin-bottom: 1rem;">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Kode Pohon</span>
                <PerkebunanFormSelect
                  modelValue={f().kodePohon}
                  options={['K001', 'K002', 'K003', 'K004']}
                  placeholder="Kode Pohon"
                  onUpdate:modelValue={(val) => { f().kodePohon = val }}
                />
              </div>
            ) : (
              <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center; color: #64748b; font-size: 0.88rem; font-weight: 700;">
                Pencatatan penanaman berlaku untuk seluruh area lahan
              </div>
            )}

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Deskripsi (Opsional)</span>
              <PerkebunanFormInput
                modelValue={f().deskripsiPenanaman}
                type="textarea"
                placeholder="Masukkan deskripsi"
                onUpdate:modelValue={(val) => { f().deskripsiPenanaman = val }}
              />
            </div>
          </>
        )}

        {props.kindTitle === 'Pemberian Obat' && (
          <>
            <div class="form-group" style="margin-bottom: 1rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Obat</span>
              <PerkebunanFormSelect
                modelValue={f().jenisObat}
                options={['Fungisida', 'Pestisida', 'Nutrisi Daun']}
                placeholder="Jenis Obat"
                onUpdate:modelValue={(val) => { f().jenisObat = val }}
              />
            </div>

            {props.activeMode === 'pohon' ? (
              <div class="form-group" style="margin-bottom: 1rem;">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Kode Pohon</span>
                <PerkebunanFormSelect
                  modelValue={f().kodePohonPerawatan}
                  options={['K001', 'K002', 'K003']}
                  placeholder="Kode Pohon"
                  onUpdate:modelValue={(val) => { f().kodePohonPerawatan = val }}
                />
              </div>
            ) : (
              <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center; color: #64748b; font-size: 0.88rem; font-weight: 700;">
                Pemberian obat berlaku untuk seluruh area lahan
              </div>
            )}

            <div class="form-group" style="margin-bottom: 1rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Bagian Pohon</span>
              <PerkebunanFormSelect
                modelValue={f().bagianPohon}
                options={['Daun', 'Batang', 'Akar', 'Semua Bagian']}
                placeholder="Bagian Pohon"
                onUpdate:modelValue={(val) => { f().bagianPohon = val }}
              />
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Teknik Pemberian Obat</span>
              <PerkebunanFormSelect
                modelValue={f().teknikPemberian}
                options={['Semprot', 'Siram', 'Oles']}
                placeholder="Teknik Pemberian Obat"
                onUpdate:modelValue={(val) => { f().teknikPemberian = val }}
              />
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Nama Obat</span>
              <PerkebunanFormInput
                modelValue={f().namaObat}
                placeholder="Masukkan nama obat"
                onUpdate:modelValue={(val) => { f().namaObat = val }}
              />
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Dosis Obat (ML)</span>
              <PerkebunanFormInput
                modelValue={f().dosisObat}
                placeholder="Masukkan dosis obat"
                onUpdate:modelValue={(val) => { f().dosisObat = val }}
              />
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Deskripsi (Opsional)</span>
              <PerkebunanFormInput
                modelValue={f().deskripsiPerawatan}
                type="textarea"
                placeholder="Masukkan deskripsi"
                onUpdate:modelValue={(val) => { f().deskripsiPerawatan = val }}
              />
            </div>
          </>
        )}

        {props.kindTitle === 'Pemangkasan' && (
          <>
            {props.activeMode === 'pohon' ? (
              <div class="form-group" style="margin-bottom: 1rem;">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Kode Pohon</span>
                <PerkebunanFormSelect
                  modelValue={f().kodePohon}
                  options={['K001', 'K002', 'K003', 'K004']}
                  placeholder="Kode Pohon"
                  onUpdate:modelValue={(val) => { f().kodePohon = val }}
                />
              </div>
            ) : (
              <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center; color: #64748b; font-size: 0.88rem; font-weight: 700;">
                Pemangkasan berlaku untuk seluruh area lahan
              </div>
            )}

            <div class="form-group" style="margin-bottom: 1rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jumlah Pemangkasan (Kg)</span>
              <PerkebunanFormInput
                modelValue={f().jumlahPemangkasan}
                placeholder="Masukkan berat pemangkasan"
                onUpdate:modelValue={(val) => { f().jumlahPemangkasan = val }}
              />
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Deskripsi (Opsional)</span>
              <PerkebunanFormInput
                modelValue={f().deskripsiPemangkasan}
                type="textarea"
                placeholder="Masukkan deskripsi"
                onUpdate:modelValue={(val) => { f().deskripsiPemangkasan = val }}
              />
            </div>
          </>
        )}

        {props.kindTitle === 'Pemupukan' && (
          <>
            <div class="form-group" style="margin-bottom: 1rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Pupuk</span>
              <PerkebunanFormSelect
                modelValue={f().jenisPupuk}
                options={['Pupuk Cair', 'Pupuk Organik', 'Pupuk Kompos']}
                placeholder="Jenis Pupuk"
                onUpdate:modelValue={(val) => { f().jenisPupuk = val }}
              />
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Fase Pohon</span>
              <PerkebunanFormSelect
                modelValue={f().fasePohon}
                options={['Vegetatif', 'Generatif']}
                placeholder="Fase Pohon"
                onUpdate:modelValue={(val) => { f().fasePohon = val }}
              />
            </div>

            {props.activeMode === 'pohon' ? (
              <div class="form-group" style="margin-bottom: 1rem;">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Daftar Kode Pohon</span>
                <PerkebunanFormSelect
                  modelValue={f().kodePohonPemupukan}
                  options={['K001', 'K002', 'K003']}
                  placeholder="Kode Pohon"
                  onUpdate:modelValue={(val) => { f().kodePohonPemupukan = val }}
                />
              </div>
            ) : (
              <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center; color: #64748b; font-size: 0.88rem; font-weight: 700;">
                Pemupukan berlaku untuk seluruh area lahan
              </div>
            )}

            <div class="form-group" style="margin-bottom: 1rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jumlah Berat Pupuk (Kg)</span>
              <PerkebunanFormInput
                modelValue={f().jumlahBeratPupuk}
                placeholder="Masukkan total berat pupuk"
                onUpdate:modelValue={(val) => { f().jumlahBeratPupuk = val }}
              />
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Deskripsi (Opsional)</span>
              <PerkebunanFormInput
                modelValue={f().deskripsiPemupukan}
                type="textarea"
                placeholder="Masukkan deskripsi"
                onUpdate:modelValue={(val) => { f().deskripsiPemupukan = val }}
              />
            </div>
          </>
        )}

        {props.kindTitle === 'Pembersihan' && (
          <>
            {props.activeMode === 'pohon' ? (
              <div class="form-group" style="margin-bottom: 1rem;">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Kode Pohon</span>
                <PerkebunanFormSelect
                  modelValue={f().kodePohon}
                  options={['K001', 'K002', 'K003', 'K004']}
                  placeholder="Kode Pohon"
                  onUpdate:modelValue={(val) => { f().kodePohon = val }}
                />
              </div>
            ) : (
              <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center; color: #64748b; font-size: 0.88rem; font-weight: 700;">
                Pembersihan berlaku untuk seluruh area lahan
              </div>
            )}

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Deskripsi (Opsional)</span>
              <PerkebunanFormInput
                modelValue={f().deskripsiPembersihan}
                type="textarea"
                placeholder="Masukkan deskripsi"
                onUpdate:modelValue={(val) => { f().deskripsiPembersihan = val }}
              />
            </div>
          </>
        )}
      </div>
    )
  }
})
