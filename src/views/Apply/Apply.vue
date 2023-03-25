<template>
  <!-- 审批页功能栏 -->
  <div class="apply-title">
    <el-button type="primary" @click="handleOpen">添加审批</el-button>
    <el-space>
      <el-input v-model="searchWord" placeholder="请输入搜索关键词" />
      <el-button type="primary" icon="search">搜索</el-button>
      <el-divider direction="vertical"></el-divider>
      <el-radio-group v-model="approverType">
        <el-radio-button label="全部" />
        <el-radio-button label="待审批" />
        <el-radio-button label="已通过" />
        <el-radio-button label="未通过" />
      </el-radio-group>
    </el-space>
  </div>
  <!-- 数据表格组件 -->
  <div class="apply-table">
    <el-table :data="pageApplyList" border>
      <el-table-column prop="applicantname" label="申请人" width="180" />
      <el-table-column prop="reason" label="审批事由" width="180" />
      <el-table-column prop="time" label="时间">
        <template #default="scope">
          {{ scope.row.time.join(" - ") }}
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注" />
      <el-table-column prop="approvername" label="审批人" width="180" />
      <el-table-column prop="state" label="状态" width="180" />
    </el-table>
    <!-- 分页组件 -->
    <el-pagination
      small
      background
      layout="prev, pager, next"
      :total="applyList.length"
      :page-size="pageSize"
      @current-change="handleChange"
    />
  </div>
  <!-- 弹出框布局，主要用到对话框组件 -->
  <el-dialog
    v-model="dialogVisible"
    title="添加审批"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="审批人" prop="approvername">
        <el-select v-model="ruleForm.approvername" placeholder="请选择审批人">
          <el-option
            v-for="item in approver"
            :key="(item._id as string)"
            :value="(item.name as string)"
            :label="(item.name as string)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审批事由" prop="reason">
        <el-select v-model="ruleForm.reason" placeholder="请选择审批事由">
          <el-option value="年假" label="年假" />
          <el-option value="事假" label="事假" />
          <el-option value="病假" label="病假" />
          <el-option value="外出" label="外出" />
          <el-option value="补签卡" label="补签卡" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker
          v-model="ruleForm.time"
          type="datetimerange"
          start-placeholder="起始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input
          v-model="ruleForm.note"
          :autosize="{ minRows: 4, maxRows: 6 }"
          type="textarea"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >提交</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import type { DateModelType, FormInstance, FormRules } from "element-plus";
import moment from "moment";
import { useStore } from "@/store";
const store = useStore();

const usersInfos = computed(() => store.state.users.infos);
const approver = computed(
  () => usersInfos.value.approver as { [index: string]: unknown }[]
);

// 完成分页的逻辑处理
const pageSize = ref(2);
const pageCurrent = ref(1);
const pageApplyList = computed(() =>
  applyList.value.slice(
    (pageCurrent.value - 1) * pageSize.value,
    pageCurrent.value * pageSize.value
  )
);
const handleChange = (value: number) => {
  pageCurrent.value = value;
};
// 需要对applyList数据进行筛选操作
const defaultType = "全部";
const approverType = ref(defaultType);
const searchWord = ref("");
const applyList = computed(() =>
  store.state.checks.applyList.filter(
    (v) =>
      (v.state === approverType.value || defaultType === approverType.value) &&
      (v.note as string).includes(searchWord.value)
  )
);
// 弹出框控制
const dialogVisible = ref(false);
const handleClose = () => {
  dialogVisible.value = false;
};
const handleOpen = () => {
  dialogVisible.value = true;
};
//定义弹出框数据
interface ApplyList {
  applicantid: string;
  applicantname: string;
  approverid: string;
  approvername: string;
  note: string;
  reason: string;
  time: [DateModelType, DateModelType];
}
const ruleFormRef = ref<FormInstance>();
//2.数据收集
const ruleForm = reactive<ApplyList>({
  applicantid: "",
  applicantname: "",
  approverid: "",
  approvername: "",
  note: "",
  reason: "",
  time: ["", ""],
});
// 自定义time认证
const validatorTime = (
  rule: unknown,
  value: [DateModelType, DateModelType],
  callback: (arg?: Error) => void
) => {
  if (!value[0] && !value[1]) {
    callback(new Error("请选择审批时间"));
  } else {
    callback();
  }
};
// 校验规则
const rules = reactive<FormRules>({
  approvername: [{ required: true, message: "请选择审批人", trigger: "blur" }],
  reason: [{ required: true, message: "请选择请假事由", trigger: "blur" }],
  time: [{ validator: validatorTime, trigger: "blur" }],
  note: [{ required: true, message: "请添加审批备注", trigger: "blur" }],
});
// 提交数据
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      ruleForm.applicantid = usersInfos.value._id as string;
      ruleForm.applicantname = usersInfos.value.name as string;
      ruleForm.approverid = (
        approver.value.find((v) => v.name === ruleForm.approvername) as {
          [index: string]: unknown;
        }
      )._id as string;
      ruleForm.time[0] = moment(ruleForm.time[0]).format("YYYY-MM-DD hh:mm:ss");
      ruleForm.time[1] = moment(ruleForm.time[1]).format("YYYY-MM-DD hh:mm:ss");
      store.dispatch("checks/postApply", ruleForm).then((res) => {
        if (res.data.errcode === 0) {
          // 再次发pagination起请求做到添加页面的更新
          store
            .dispatch("checks/getApply", { applicantid: usersInfos.value._id })
            .then((res) => {
              if (res.data.errcode === 0) {
                store.commit("checks/updateApplyList", res.data.rets);
              }
            });
          // 在我的考勤审批页或添加考勤审批页中进行操作的时候，就会触发更新消息提醒的功能。
          store.dispatch("news/putRemind", {
            userid: ruleForm.approverid,
            approver: true,
          });
          ElMessage.success("添加审批成功");
          resetForm(ruleFormRef.value);
          handleClose();
        }
      });
    } else {
      console.log("error submit!");
      return false;
    }
  });
};
// 重置数据
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>

<style scoped lang="scss">
.apply-title {
  margin: 20px;
  display: flex;
  justify-content: space-between;
}
.apply-table {
  margin: 10px;
  .el-pagination {
    float: right;
    margin: 10px;
  }
}
</style>
