<template>
  <layout :callback="callback">
    <div>
      <md-table
        v-model="tablePages.mdData"
        md-sort="id"
        @md-selected="onSelected"
      >
        <md-table-toolbar>
          <div class="md-title left-align">
            All Assignments
          </div>
        </md-table-toolbar>
        <md-table-row
          slot="md-table-row"
          slot-scope="{ item }"
          md-selectable="single"
        >
          <md-table-cell md-label="ID" md-sort-by="id" md-numeric>{{
            item.id
          }}</md-table-cell>
          <md-table-cell md-label="Name" md-sort-by="name">{{
            item.name
          }}</md-table-cell>
          <md-table-cell md-label="Author">
            <UserProfileIcon
              :uid="item.author"
              :garnBarnApiCaller="garnBarnAPICaller"
            ></UserProfileIcon>
          </md-table-cell>
          <md-table-cell md-label="Tag" md-sort-by="tag.id">
            <div v-if="item.tag">
              <TagBoxChip :color="item.tag.color" :text="item.tag.name">
              </TagBoxChip>
            </div>
          </md-table-cell>
          <md-table-cell md-label="Due Date" md-sort-by="dueDate">
            <div v-if="item.dueDate">
              {{ getHumanReadableTime(item.dueDate) }}
            </div>
            <div v-else><i>No due date</i></div>
          </md-table-cell>
        </md-table-row>
      </md-table>
      <div class="load-next-box">
        <md-button class="md-secondary" v-if="getNextData" @click="processNext"
          >Load next assignments?</md-button
        >
        <h3 v-else><i>That all assignments you got.</i> ƪ(=ｘωｘ=ƪ)</h3>
      </div>
      <md-speed-dial class="md-bottom-right">
        <md-speed-dial-target class="md-primary">
          <md-icon class="md-morph-initial">menu</md-icon>
          <md-icon class="md-morph-final">edit</md-icon>
        </md-speed-dial-target>

        <md-speed-dial-content>
          <md-button class="md-icon-button" @click="edit">
            <md-icon>add</md-icon>
            <md-tooltip> Create new assignment </md-tooltip>
          </md-button>
        </md-speed-dial-content>
      </md-speed-dial>
      <DialogBoxComponent
        :dialogBoxId="'createDialogBox'"
        :isCustomDialogBox="true"
        class="blur"
      >
        <md-card-content>
          <md-tabs md-dynamic-height>
            <md-tab md-label="Create">
              <Create
                :apiData="assignmentData"
                :creationType="creationType"
                :firebaseUser="firebaseUser"
                md-dynamic-height
                ref="assignmentCreate"
              ></Create>
            </md-tab>

            <md-tab md-disabled>
              <md-tab md-label="Notification Settings">
                <notification-setting 
                :reminderTime="assignmentData.reminderTime"
                ref="notificationSetting"></notification-setting>
              </md-tab>
            </md-tab>
          </md-tabs>
        </md-card-content>
      </DialogBoxComponent>
    </div>
  </layout>
</template>

<script lang="ts">
import { Component, Vue, Ref } from "vue-property-decorator";
import { AssignmentApi } from "@/types/GarnBarnApi/AssignmentApi";
import Layout from "@/layouts/Main.vue";
import DialogBox from "@/components/DialogBox/DialogBox";
import DialogBoxComponent from "@/components/DialogBox/DialogBoxComponent.vue";
import Create from "@/components/Create.vue";
import NotificationSetting from "@/components/NotificationSetting.vue"
import UserProfileIcon from "@/components/UserProfileIcon.vue";
import TagBoxChip from "@/components/Tag/TagBoxChip.vue";
import GarnBarnApi from "@/services/GarnBarnApi/GarnBarnApi";
import firebase from "firebase/app";
import { Assignment } from "@/types/garnbarn/Assignment";
import { GetAllAssignmentApiNextFunctionWrapper } from "@/types/GarnBarnApi/GarnBarnApiResponse";

type TimeData = {
  time: number,
  unit: number
}

@Component({
  components: {
    Layout,
    DialogBoxComponent,
    Create,
    UserProfileIcon,
    TagBoxChip,
    NotificationSetting
  },
})
export default class Assignments extends Vue {
  @Ref() readonly assignmentCreate!: Create;
  @Ref() readonly notificationSetting!: NotificationSetting;

  createDialogBox = new DialogBox("createDialogBox");
  loadingDialogBox = new DialogBox("loadingDialogBox");
  informDialogBox = new DialogBox("informDialogBox");
  creationType = "assignment";
  tablePages = {
    mdCount: null as number | null,
    mdPage: null as number | null,
    mdData: [] as Array<Assignment>,
  };
  rowsPerPage = 10;
  assignmentData: AssignmentApi = {
    id: undefined,
    name: undefined,
    description: undefined,
    reminderTime: [],
    dueDate: undefined,
    tagId: undefined,
  };
  garnBarnAPICaller: GarnBarnApi | undefined = undefined;
  getNextData: GetAllAssignmentApiNextFunctionWrapper | null = null;
  firebaseUser: firebase.User | null = null;

  callback(user: firebase.User, loadingDialogBox: DialogBox): void {
    this.garnBarnAPICaller = new GarnBarnApi(user);
    this.updatePagination(1, this.rowsPerPage).then(() => {
      this.firebaseUser = user;
      loadingDialogBox.dismiss();
    });
  }

  onSelected(item: Assignment) {
    this.$router.push("assignment/" + item.id.toString());
  }

  async updatePagination(
    page: number,
    pageSize: number,
    sort?: any,
    sortOrder?: any
  ): Promise<void> {
    this.garnBarnAPICaller?.v1.assignments
      .all(false, page)
      .then((apiResponse) => {
        this.tablePages = {
          mdCount: apiResponse.data.count,
          mdPage: 1,
          mdData: apiResponse.data.results,
        };
        this.rowsPerPage = apiResponse.data.results.length;
        this.getNextData = apiResponse.data.next;
      });
  }

  processNext(): void {
    this.informDialogBox
      .show({
        dialogBoxContent: {
          title: "Grabing Data",
          content: "Grabing data from GarnBarn API",
        },
        dialogBoxActions: [],
      })
      .then(() => {
        if (!this.getNextData) {
          return Promise.reject("No next function");
        }
        return this.getNextData();
      })
      .then((apiResponse) => {
        this.tablePages.mdData = this.tablePages.mdData.concat(
          apiResponse.data.results
        );
        this.getNextData = apiResponse.data.next;
        return this.informDialogBox.dismiss();
      });
  }

  edit(): void {
    this.createDialogBox.show({
      dialogBoxActions: [
        {
          buttonContent: "Save",
          buttonClass: "md-primary md-raised",
          onClick: async (): Promise<void> => {
            this.createAssignment();
            this.createDialogBox.dismiss();
          },
        },
        {
          buttonContent: "Exit",
          buttonClass: "md-secondary",
          onClick: (): void => {
            this.createDialogBox.dismiss();
          },
        },
      ],
    });
  }

  createAssignment(): void {
    this.assignmentData.reminderTime = this.filterValidReminderTime(
      this.processTimeDataToReminderTime(this.notificationSetting.timeData as TimeData[])
    );
    this.garnBarnAPICaller?.v1.assignments
      .create(this.assignmentCreate.apiData)
      .then((apiResponse) => {
        this.informDialogBox.show({
          dialogBoxContent: {
            title: "Assignment is now creating.",
            content: `It may take up to 30 seconds for the assignment to be created.`,
          },
          dialogBoxActions: [
            {
              buttonContent: "Ok",
              buttonClass: "md-secondary",
              onClick: async () => {
                this.informDialogBox.dismiss();
                if (!this.garnBarnAPICaller?.v1.assignments.getFirebaseUser()) {
                  return;
                }
                this.loadingDialogBox.show();
                this.tablePages.mdData = [];
                this.callback(
                  this.garnBarnAPICaller?.v1.assignments.getFirebaseUser(),
                  this.loadingDialogBox
                );
              },
            },
          ],
        });
      })
      .catch((e) => {
        this.informDialogBox.show({
          dialogBoxContent: {
            title: "An Error occurred",
            content: e.message,
          },
          dialogBoxActions: [
            {
              buttonContent: "Ok",
              buttonClass: "md-primary",
              onClick: async () => {
                await this.informDialogBox.dismiss();
                this.edit();
              },
            },
          ],
        });
      });
  }

  getHumanReadableTime(timestamp: number): string {
    const dueDate = new Date(timestamp);
    return dueDate.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  getUnixTimeFromTimeData(timeData: TimeData): number {
    return timeData.time * timeData.unit;
  }

  processTimeDataToReminderTime(timeData: TimeData[] | null): number[] | undefined {
    if (timeData) {
      return timeData.map((time) => 
        this.getUnixTimeFromTimeData(time)
      )    
    }
  }

  filterValidReminderTime(reminderTime: number[] | undefined): number[] | undefined{
    if (reminderTime) {
      return reminderTime.filter(time => time > 0)
    }
  }
}
</script>

<style scoped>
.blur {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.md-table + .md-table {
  margin-top: 16px;
}
.avatar img {
  max-width: 30px;
}

.left-align {
  text-align: left;
}
.profile-image {
  width: 30px;
  height: 30px;
  border-radius: 100px;
}
</style>
