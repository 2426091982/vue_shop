<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.quert">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="ordersList" :border="true" stripe>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="250px">
        </el-table-column>
        <el-table-column label="订单价格" prop="order_price"> </el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === '1'" type="success"
              >已付款</el-tag
            >
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"> </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <!-- 修改地址按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showCityDialog"
            ></el-button>
            <!-- 查看物流按钮 -->
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 省市区联动对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="cityDialogVisible"
      width="50%"
      @close="cityDialogClosed"
    >
      <!-- 表单区域 -->
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        label-width="100px"
        :rules="addressFormRules"
      >
        <el-form-item label="省/市/区" prop="address1">
          <el-cascader
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cityDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 快递物流对话框 -->
    <el-dialog title="快递物流" :visible.sync="progressVisible" width="50%">
      <!-- 时间线区域 -->
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in progressList"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
// 导入城市数据
import cityData from "./citydata";

export default {
  data() {
    return {
      queryInfo: {
        query: "",
        // 页码
        pagenum: 1,
        // 每条显示多少数据
        pagesize: 5
      },
      // 订单列表数据
      ordersList: [],
      // 总数据条数
      total: 0,
      //  省市区对话框显示或者隐藏
      cityDialogVisible: false,
      // 省市区表单
      addressForm: {
        address1: "",
        address2: ""
      },
      // 省市区表单验证规则
      addressFormRules: {
        address2: [
          {
            required: true,
            message: "请输入详细地址",
            tigger: "blur"
          }
        ]
      },
      // 城市数据
      cityData: cityData,
      // 控制快递物流对话框
      progressVisible: false,
      // 快递物流数据
      progressList: []
    };
  },
  created() {
    // 获取订单列表数据
    this.getOrdersList();
  },
  methods: {
    // 获取订单列表数据
    async getOrdersList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表数据失败!");
      }
      // 订单列表
      this.ordersList = res.data.goods;
      // 订单总条数
      this.total = res.data.total;
      console.log(this.ordersList);
    },
    // 监听数据显示条数改变
    handleSizeChange(newSize) {
      // 赋值新的数据条数
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    // 监听数据页码改变
    handleCurrentChange(newNum) {
      // 赋值新的页码
      this.queryInfo.pagenum = newNum;
      this.getOrdersList();
    },
    // 展示省市区对话框
    showCityDialog() {
      this.cityDialogVisible = true;
    },
    // 监听省市区对话框关闭
    cityDialogClosed() {
      // 重置表单
      this.$refs.addressFormRef.resetFields();
    },
    // 修改地址(假)
    editAddress() {
      this.$refs.addressFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) {
          return; // 验证不通过
        } else {
          // 关闭对话框
          this.cityDialogVisible = false;
        }
      });
    },
    // 展示快递物流对话框
    async showProgressDialog() {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");

      if (res.meta.status !== 200) {
        return this.$message.error("获取物流数据失败!");
      }
      this.progressList = res.data;
      console.log(this.progressList);
      this.progressVisible = true;
    }
  }
};
</script>

<style lang="less" scope>
.el-cascader {
  width: 100%;
}
</style>
