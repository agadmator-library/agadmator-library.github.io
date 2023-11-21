<script setup lang="ts">
import PlayerFilterSelector from "@/components/filters/PlayerFilterSelector.vue";
import {AddVideoFilterEvent} from "@/event/AddVideoFilterEvent";
import {VideoFilter} from "@/model/VideoFilter";
import {FiltersModifiedEvent} from "@/event/FiltersModifiedEvent";
import MatchBetweenFilterSelector from "@/components/filters/MatchBetweenFilterSelector.vue";
import TitleFilterSelector from "@/components/filters/TitleFilterSelector.vue";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import _ from "lodash";
import PublishedFromFilterSelector from "@/components/filters/PublishedFromFilterSelector.vue";
import PublishedToFilterSelector from "@/components/filters/PublishedToFilterSelector.vue";
import LengthFromFilterSelector from "@/components/filters/LengthFromFilterSelector.vue";
import LengthToFilterSelector from "@/components/filters/LengthToFilterSelector.vue";
import AtLeastOneGameFilterSelector from "@/components/filters/AtLeastOneGameFilterSelector.vue";
import MultipleGamesFilterSelector from "@/components/filters/MultipleGamesFilterSelector.vue";
import GameResultFilterSelector from "@/components/filters/GameResultFilterSelector.vue";
import GameYearFromFilterSelector from "@/components/filters/GameYearFromFilterSelector.vue";
import GameYearToFilterSelector from "@/components/filters/GameYearToFilterSelector.vue";
import GameOpeningFilterSelector from "@/components/filters/GameOpeningFilterSelector.vue";
import WhitePlayedB4FilterSelector from "@/components/filters/WhitePlayedB4FilterSelector.vue";
import UnderpromotionFilterSelector from "@/components/filters/UnderpromotionFilterSelector.vue";
import MovesFromFilterSelector from "@/components/filters/MovesFromFilterSelector.vue";
import MovesToFilterSelector from "@/components/filters/MovesToFilterSelector.vue";
import QueenCountFilterSelector from "@/components/filters/QueenCountFilterSelector.vue";
import ChessboardFilterSelector from "@/components/filters/ChessboardFilterSelector.vue";
import AppliedVideoFilters from "@/components/filters/AppliedVideoFilters.vue";
import {ref} from "vue";

const filters = ref<Array<VideoFilter>>([])

const emits = defineEmits(['filtersModified'])

function onAddFilter(event: AddVideoFilterEvent) {
  filters.value.push(event.videoFilter)
  emits('filtersModified', new FiltersModifiedEvent(filters.value))
}

function onReplaceFilter(event: ReplaceVideoFilterEvent) {
  let idx = filters.value.findIndex(event.predicate)
  if (idx >= 0) {
    filters.value[idx] = event.replacementStrategy.replace(filters.value[idx], event.videoFilter)
  } else {
    filters.value.push(event.videoFilter)
  }
  emits('filtersModified', new FiltersModifiedEvent(filters.value))
}

function onRemoveFilter(event: RemoveVideoFilterEvent) {
  _.remove(filters.value, event.predicate)
  emits('filtersModified', new FiltersModifiedEvent(filters.value))
}

function isLarge() {
  return window.innerWidth > 1000
}

</script>

<template>
  <div class="card mt-2">
    <div class="card-header">
      Filters
      <button class="btn btn-light float-end p-0" type="button" data-bs-toggle="collapse"
              href="#filtersCard" aria-expanded="false" aria-controls="filtersCard">
        &#x21D5;
      </button>
    </div>

    <div class="card-body collapse" :class="[isLarge() ? 'show' : '']" id="filtersCard">
      <div class="card">
        <div class="card-header" data-bs-toggle="collapse"
             href="#playerFiltersCard" aria-expanded="false" aria-controls="playerFiltersCard">
          Player filters
          <button class="btn btn-light float-end p-0" type="button">
            &#x21D5;
          </button>
        </div>
        <div class="card-body collapse show" id="playerFiltersCard">
          <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
              <button class="nav-link active" id="nav-single-player-tab" data-bs-toggle="tab"
                      data-bs-target="#nav-single-player" type="button" role="tab" aria-controls="nav-home"
                      aria-selected="true">Single
              </button>
              <button class="nav-link" id="nav-match-tab" data-bs-toggle="tab" data-bs-target="#nav-match" type="button"
                      role="tab" aria-controls="nav-profile" aria-selected="false">Match
              </button>
            </div>
          </nav>
          <div class="tab-content ms-2 mt-1" id="nav-tabContent">
            <div class="tab-pane fade show active" id="nav-single-player" role="tabpanel"
                 aria-labelledby="nav-single-player-tab">
              <form class="row align-items-center" action="" id="playerFilterForm">
                <PlayerFilterSelector @addFilter="onAddFilter"></PlayerFilterSelector>
              </form>
            </div>
            <div class="tab-pane fade" id="nav-match" role="tabpanel" aria-labelledby="nav-match-tab">
              <form class="row" action="" id="matchFilterForm">
                <MatchBetweenFilterSelector @addFilter="onAddFilter"></MatchBetweenFilterSelector>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-2">
        <div class="card-header" data-bs-toggle="collapse"
             href="#videoFiltersCard" aria-expanded="false" aria-controls="videoFiltersCard">
          Video filters
          <button class="btn btn-light float-end p-0" type="button">
            &#x21D5;
          </button>
        </div>
        <div class="card-body collapse" id="videoFiltersCard">
          <form class="row align-items-center" action="" id="videoFiltersForm">
            <div class="row">
              <div class="input-group">
                <TitleFilterSelector class="form-control" @addFilter="onAddFilter" @replaceFilter="onReplaceFilter"
                                     @removeFilter="onRemoveFilter"></TitleFilterSelector>
              </div>
            </div>

            <div class="row mt-2">
              <div class="col input-group">
                <PublishedFromFilterSelector @replaceFilter="onReplaceFilter"></PublishedFromFilterSelector>
                <span class="input-group-text d-none d-lg-block">-</span>
                <PublishedToFilterSelector @replaceFilter="onReplaceFilter"></PublishedToFilterSelector>
              </div>
              <div class="col input-group mt-2 mt-lg-0 justify-content-lg-end">
                <LengthFromFilterSelector @replaceFilter="onReplaceFilter"
                                          @removeFilter="onRemoveFilter"></LengthFromFilterSelector>
                <span class="input-group-text d-none d-lg-block">-</span>
                <LengthToFilterSelector @replaceFilter="onReplaceFilter"
                                        @removeFilter="onRemoveFilter"></LengthToFilterSelector>
              </div>
            </div>

            <div class="row mt-2">
              <div class="col-auto">
                <AtLeastOneGameFilterSelector @addFilter="onAddFilter"
                                              @removeFilter="onRemoveFilter"></AtLeastOneGameFilterSelector>
              </div>
              <div class="col-auto">
                <MultipleGamesFilterSelector @addFilter="onAddFilter"
                                             @removeFilter="onRemoveFilter"></MultipleGamesFilterSelector>
              </div>
            </div>

          </form>
        </div>
      </div>

      <div class="card mt-2">
        <div class="card-header" data-bs-toggle="collapse"
             href="#gameFiltersCard" aria-expanded="false" aria-controls="gameFiltersCard">
          Game filters
          <button class="btn btn-light float-end p-0" type="button">
            &#x21D5;
          </button>
        </div>
        <div class="card-body collapse" id="gameFiltersCard">
          <form class="align-items-center mb-2" action="" id="playerNamesFilterForm">
            <div class="row">
              <div class="col">
                <GameOpeningFilterSelector @replaceFilter="onReplaceFilter"></GameOpeningFilterSelector>
              </div>
            </div>
            <div class="row mt-2">
              <div class="col">
                <GameResultFilterSelector @addFilter="onAddFilter"
                                          @removeFilter="onRemoveFilter"></GameResultFilterSelector>

              </div>
              <div class="col">
                <QueenCountFilterSelector @addFilter="onAddFilter"
                                          @removeFilter="onRemoveFilter"></QueenCountFilterSelector>
              </div>
              <div class="col">
                <div class="form-check form-check-inline">
                  <WhitePlayedB4FilterSelector @replaceFilter="onReplaceFilter"
                                               @removeFilter="onRemoveFilter"></WhitePlayedB4FilterSelector>
                </div>
              </div>
              <div class="col">
                <div class="form-check form-check-inline">
                  <UnderpromotionFilterSelector @replaceFilter="onReplaceFilter"
                                                @removeFilter="onRemoveFilter"></UnderpromotionFilterSelector>
                </div>
              </div>
            </div>
            <div class="row mt-2">
              <div class="col">
                <div class="input-group">
                  <MovesFromFilterSelector @replaceFilter="onReplaceFilter"
                                           @removeFilter="onRemoveFilter"></MovesFromFilterSelector>
                  <span class="input-group-text d-none d-lg-block">-</span>
                  <MovesToFilterSelector @replaceFilter="onReplaceFilter"
                                         @removeFilter="onRemoveFilter"></MovesToFilterSelector>
                </div>
              </div>
              <div class="col mt-2 mt-lg-0">
                <div class="input-group">
                  <GameYearFromFilterSelector @replaceFilter="onReplaceFilter"
                                              @removeFilter="onRemoveFilter"></GameYearFromFilterSelector>
                  <span class="input-group-text d-none d-lg-block">-</span>
                  <GameYearToFilterSelector @replaceFilter="onReplaceFilter"
                                            @removeFilter="onRemoveFilter"></GameYearToFilterSelector>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="card mt-2">
        <div class="card-header" data-bs-toggle="collapse"
             href="#chessboardCard" aria-expanded="false" aria-controls="chessboardCard">
          Chessboard filter
          <button class="btn btn-light float-end p-0" type="button">
            &#x21D5;
          </button>
        </div>
        <div class="card-body collapse" id="chessboardCard">
          <ChessboardFilterSelector :filters=filters @replaceFilter="onReplaceFilter"
                                    @removeFilter="onRemoveFilter"></ChessboardFilterSelector>
        </div>
      </div>

    </div>
  </div>
  <AppliedVideoFilters :filters=filters @removeFilter="onRemoveFilter"></AppliedVideoFilters>
</template>

<style scoped>

</style>