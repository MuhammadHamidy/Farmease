import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PerkebunanHero',
  setup() {
    return () => (
      <section class="hero-strip">
        <div class="hero-copy">
          <span class="hero-badge">Ringkas & cepat</span>
          <h2>Kelola tugas lapangan tanpa perlu membuka banyak menu.</h2>
          <p>Semua tugas harian, pencatatan, dan status jadwal disusun agar operator langsung tahu apa yang harus dikerjakan.</p>
        </div>
        <div class="hero-stats">
          <article>
            <strong>03</strong>
            <span>Jadwal aktif</span>
          </article>
          <article>
            <strong>12</strong>
            <span>Catatan hari ini</span>
          </article>
          <article>
            <strong>89%</strong>
            <span>Tugas selesai</span>
          </article>
        </div>
      </section>
    )
  },
})
