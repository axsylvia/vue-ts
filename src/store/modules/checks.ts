import http from "@/utils/http";
import type { MutationTree, ActionTree, GetterTree } from "vuex";
import type { State } from "../index";
interface Infos {
  [index: string]: unknown;
}
export interface ChecksState {
  applyList: Infos[];
  checkList: Infos[];
}
const state: ChecksState = {
  // 申请人
  applyList: [],
  // 审批人
  checkList: [],
};
const mutations: MutationTree<ChecksState> = {
  updateApplyList(state, payload) {
    state.applyList = payload;
  },
  updateCheckList(state, payload) {
    state.checkList = payload;
  },
};
//审批信息接口
const actions: ActionTree<ChecksState, State> = {
  getApply(context, payload) {
    return http.get("/checks/apply", payload);
  },
  postApply(context, payload) {
    return http.post("/checks/apply", payload);
  },
  // 更新审批信息接口
  putApply(context, payload) {
    return http.put("/checks/apply", payload);
  },
};
const getters: GetterTree<ChecksState, State> = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
