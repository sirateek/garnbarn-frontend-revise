import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Index from "@/views/Index.vue";
import Home from "@/views/Home.vue";
import SignIn from "@/views/SignIn.vue";
import AssignmentDetailView from "@/views/Assignment/AssignmentDetailView.vue";
import Assignments from "@/views/Assignment/Assignments.vue";
import Tags from "@/views/Tags.vue"
import Account from "@/views/Account.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Index",
    component: Index,
  },
  {
    path: "/signin",
    name: "SignIn",
    component: SignIn,
  },
  {
    path: "/home",
    name: "HomePage",
    component: Home,
  },
  {
    path: "/assignment",
    name: "Assignments",
    component: Assignments
  },
  {
    path: "/assignment/:id",
    name: "AssignmentPage",
    component: AssignmentDetailView,
  },
  {
    path: "/tag",
    name: "Tags",
    component: Tags,
  },
  {
    path: "/account",
    name: "AccountPage",
    component: Account,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
