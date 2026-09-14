<script setup lang="ts">
import ClaimQr from '@/components/ClaimQr.vue'
import { LANGUES, langue, t } from '@/i18n'
import type { MeetupConfig } from '@/meetup/config'

const config = defineModel<MeetupConfig>({ required: true })

function setField(key: 'place' | 'claimUrl', value: string) {
  config.value = { ...config.value, [key]: value }
}

function setMorph(value: string) {
  const n = Number(value)
  config.value = { ...config.value, morphSeconds: Number.isFinite(n) ? n : 10 }
}

/**
 * Clavier du radiogroup : les fleches deplacent le choix, Tab n'entre qu'une
 * fois. Sans ca le role promet un contrat que les boutons n'ont pas.
 */
function auClavier(event: KeyboardEvent, index: number) {
  const pas = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
  if (!pas) return
  event.preventDefault()
  const cible = LANGUES[(index + pas + LANGUES.length) % LANGUES.length]!
  langue.value = cible.id
  const boutons = (event.currentTarget as HTMLElement).parentElement?.children
  const suivant = boutons?.[LANGUES.indexOf(cible)]
  if (suivant instanceof HTMLElement) suivant.focus()
}
</script>

<template>
  <div class="fiche" :aria-label="t('wall.title')">
    <div class="picker" role="radiogroup" :aria-label="t('wall.language')">
      <button
        v-for="(l, i) in LANGUES"
        :key="l.id"
        type="button"
        role="radio"
        :aria-checked="l.id === langue"
        :aria-label="l.nom"
        :lang="l.tag"
        :tabindex="l.id === langue ? 0 : -1"
        @keydown="auClavier($event, i)"
        @click="langue = l.id"
      >
        <span aria-hidden="true">{{ l.emoji }}</span>
        {{ l.nom }}
      </button>
    </div>

    <label class="champ">
      <span>{{ t('wall.place') }}</span>
      <input
        :value="config.place"
        type="text"
        autocomplete="off"
        spellcheck="false"
        @input="setField('place', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <label class="champ champ--morph">
      <span>{{ t('wall.morph') }}</span>
      <span class="morph">
        <input
          :value="config.morphSeconds"
          type="number"
          min="1"
          max="120"
          step="1"
          inputmode="numeric"
          @input="setMorph(($event.target as HTMLInputElement).value)"
        />
        <span>{{ t('wall.morphUnit') }}</span>
      </span>
    </label>

    <label class="champ">
      <span>{{ t('wall.claimUrl') }}</span>
      <input
        :value="config.claimUrl"
        type="url"
        autocomplete="off"
        spellcheck="false"
        @input="setField('claimUrl', ($event.target as HTMLInputElement).value)"
      />
    </label>
    <div class="qr">
      <ClaimQr v-if="config.claimUrl" :url="config.claimUrl" />
      <p v-else>{{ t('wall.qrEmpty') }}</p>
    </div>
  </div>
</template>

<style scoped>
.fiche {
  width: min(16.5rem, calc(100vw - 2.4rem));
  padding: 0.1rem 0 0;
  color: inherit;
  font: inherit;
}

.picker {
  display: flex;
  gap: 1.15rem;
}

.picker button {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.92rem;
  letter-spacing: -0.01em;
  color: #8a8a8a;
  cursor: pointer;
}

.picker button[aria-checked='true'] {
  color: #111;
  text-decoration: underline;
  text-underline-offset: 0.22em;
  text-decoration-thickness: 1px;
}

.picker button:hover {
  color: #111;
}

.champ {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 1.05rem;
  font-size: 0.78rem;
  letter-spacing: -0.01em;
  color: #8a8a8a;
}

.champ input {
  width: 100%;
  margin: 0;
  padding: 0.28rem 0 0.38rem;
  border: 0;
  border-bottom: 1px solid #d6d6d6;
  border-radius: 0;
  background: transparent;
  color: #111;
  font: inherit;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}

.champ input:focus {
  outline: none;
  border-bottom-color: #111;
}

.morph {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.champ--morph input {
  width: 3.2rem;
}

.champ--morph input::-webkit-outer-spin-button,
.champ--morph input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.champ--morph input[type='number'] {
  appearance: textfield;
}

.qr {
  margin-top: 0.85rem;
  width: 4.6rem;
}

.qr p {
  margin: 0;
  max-width: 11rem;
  font-size: 0.78rem;
  line-height: 1.35;
  color: #8a8a8a;
}
</style>
