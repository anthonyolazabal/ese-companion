<script lang="ts">
import type { AxiosInstance } from 'axios'
import VueApexCharts from 'vue3-apexcharts'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

export default {
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      seriesMqtt: [50, 50, 50],
      seriesCC: [50, 50, 50],
      seriesRestApi: [50, 50, 50],
      mqttUR: 0,
      mqttUP: 0,
      ccUR: 0,
      ccUP: 0,
      restapiUR: 0,
      restapiUP: 0,
      chartOptions: {
        chart: {
          height: 300,
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: {
              margin: 5,
              size: '30%',
              background: 'transparent'
            }
          }
        },
        colors: ['#F4D03F', '#F5B041', '#E67E22'],
        labels: ['Accounts', 'Roles', 'Permissions'],
        legend: {
          show: true,
          floating: true,
          fontSize: '16px',
          position: 'left',
          offsetX: -10,
          offsetY: 0,
          labels: {
            useSeriesColors: true,
          },
          markers: {
            size: 0
          },
          formatter: function (seriesName, opts) {
            return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
          },
          itemMargin: {
            vertical: 3
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              show: false
            }
          }
        }]
      },
    }
  },

  async mounted() {
    await this.$axios
      .get('/api/global')
      .then((response) => {
        this.seriesMqtt = response.data[1]['mqtt_data']
        this.seriesCC = response.data[3]['cc_data']
        this.seriesRestApi = response.data[5]['rest_api_data']
        this.mqttUR = response.data[6].user_roles
        this.mqttUP = response.data[7].user_permissions
        this.ccUR = response.data[8].cc_user_roles
        this.ccUP = response.data[9].cc_user_permissions
        this.restapiUR = response.data[10].rest_api_user_roles
        this.restapiUP = response.data[11].rest_api_user_permissions
      })
      .catch((error) => {
        console.log(error)
      });
  },
  methods: {
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12" md="12">
      <v-breadcrumbs>
        <v-breadcrumbs-item>
          <RouterLink to="/">Home</RouterLink>
        </v-breadcrumbs-item>
        <template v-slot:prepend>
          <v-icon size="small" icon="mdi-home"></v-icon>
        </template>
      </v-breadcrumbs>
    </VCol>
  </VRow>
  <VRow class="match-height">
    <VCol cols="12" md="12">
      <VCard>
        <VCardItem>
          <VCardTitle>Overview</VCardTitle>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>

  <VRow class="match-height">
    <VCol cols="12" md="4">
      <VCard>
        <VCardItem>
          <VCardTitle>MQTT</VCardTitle>
        </VCardItem>

        <VCardItem>
          <apexchart type="radialBar" :options="chartOptions" :series="seriesMqtt"></apexchart>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12" md="4">
      <VCard>
        <VCardItem>
          <VCardTitle>CONTROL CENTER</VCardTitle>
        </VCardItem>

        <VCardItem>
          <apexchart type="radialBar" :options="chartOptions" :series="seriesCC"></apexchart>
        </VCardItem>
      </VCard>
    </VCol>

    <VCol cols="12" md="4">
      <VCard>
        <VCardItem>
          <VCardTitle>REST API</VCardTitle>
        </VCardItem>

        <VCardItem>
          <apexchart type="radialBar" :options="chartOptions" :series="seriesRestApi"></apexchart>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
  <VRow class="match-height">
    <VCol cols="12" md="4">
      <VCard>
        <VCardText>
          <VRow>
            <VCol cols="12" sm="12">
              <div class="d-flex align-center">
                <div class="me-3">
                  <VAvatar color="primary" rounded size="42" class="elevation-1">
                    <VIcon size="24" icon="mdi-chart-gantt" />
                  </VAvatar>
                </div>
                <div class="d-flex flex-column">
                  <span class="text-body-1 font-weight-medium">User Roles mapping</span>
                  <span class="text-medium">
                    {{ mqttUR }}
                  </span>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="4">
      <VCard>
        <VCardText>
          <VRow>
            <VCol cols="12" sm="12">
              <div class="d-flex align-center">
                <div class="me-3">
                  <VAvatar color="primary" rounded size="42" class="elevation-1">
                    <VIcon size="24" icon="mdi-chart-gantt" />
                  </VAvatar>
                </div>
                <div class="d-flex flex-column">
                  <span class="text-body-1 font-weight-medium">User Roles mapping</span>
                  <span class="text-medium">
                    {{ ccUR }}
                  </span>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="4">
      <VCard>
        <VCardText>
          <VRow>
            <VCol cols="12" sm="12">
              <div class="d-flex align-center">
                <div class="me-3">
                  <VAvatar color="primary" rounded size="42" class="elevation-1">
                    <VIcon size="24" icon="mdi-chart-gantt" />
                  </VAvatar>
                </div>
                <div class="d-flex flex-column">
                  <span class="text-body-1 font-weight-medium">User Roles mapping</span>
                  <span class="text-medium">
                    {{ restapiUR }}
                  </span>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>


  <VRow class="match-height">
    <VCol cols="12" md="4">
      <VCard>
        <VCardText>
          <VRow>
            <VCol cols="12" sm="12">
              <div class="d-flex align-center">
                <div class="me-3">
                  <VAvatar color="primary" rounded size="42" class="elevation-1">
                    <VIcon size="24" icon="mdi-key-link" />
                  </VAvatar>
                </div>
                <div class="d-flex flex-column">
                  <span class="text-body-1 font-weight-medium">Direct User Permissions mapping</span>
                  <span class="text-medium">
                    {{ mqttUP }}
                  </span>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="4">
      <VCard>
        <VCardText>
          <VRow>
            <VCol cols="12" sm="12">
              <div class="d-flex align-center">
                <div class="me-3">
                  <VAvatar color="primary" rounded size="42" class="elevation-1">
                    <VIcon size="24" icon="mdi-key-link" />
                  </VAvatar>
                </div>
                <div class="d-flex flex-column">
                  <span class="text-body-1 font-weight-medium">Direct User Permissions mapping</span>
                  <span class="text-medium">
                    {{ ccUP }}
                  </span>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="4">
      <VCard>
        <VCardText>
          <VRow>
            <VCol cols="12" sm="12">
              <div class="d-flex align-center">
                <div class="me-3">
                  <VAvatar color="primary" rounded size="42" class="elevation-1">
                    <VIcon size="24" icon="mdi-key-link" />
                  </VAvatar>
                </div>
                <div class="d-flex flex-column">
                  <span class="text-body-1 font-weight-medium">Direct User Permissions mapping</span>
                  <span class="text-medium">
                    {{ restapiUP }}
                  </span>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
