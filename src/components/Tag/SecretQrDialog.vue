<template>
  <DialogBoxComponent :dialogBoxId="'secretQrDialog'" :isCustomDialogBox="true">
    <md-card-header>
      <div class="md-title">Tag is now creating.</div>
    </md-card-header>
    <md-card-content>
      <center>
        <div class="md-subtitle">
          It may take up to 30 seconds for the tag to be created.
        </div>
      </center>
    </md-card-content>
  </DialogBoxComponent>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Tag } from "@/types/garnbarn/Tag";
import DialogBoxComponent from "@/components/DialogBox/DialogBoxComponent.vue";

@Component({
  components: {
    DialogBoxComponent,
  },
})
export default class SecretQrDialog extends Vue {
  @Prop({ required: true }) tag!: Tag;

  getAuthAppUrl() {
    return `otpauth://totp/GarnBarn%20%28Tag%3A%20${this.tag.id}%29?secret=${this.tag.secretKeyTotp}`;
  }
}
</script>

<style scoped>
.authenticator-logo {
  width: 30px;
  height: 30px;
}
</style>
