<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户表格 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <!-- 有效图标 -->
          <i
            class="el-icon-success"
            style="color: lightgreen;"
            v-if="scope.row.cat_deleted !== true"
          ></i>
          <!-- 无效图标 -->
          <i class="el-icon-error" style="color: lightright;" v-else></i>
        </template>

        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级权限</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级权限</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级权限</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!--添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <!-- 添加分类的表单 -->
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <!-- options 指定数据源 -->
            <!-- props 指定配置对象 -->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="setRoleDialogVisible">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table 指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "isok"
        },
        {
          label: "排序",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "order"
        },
        {
          label: "操作",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "opt"
        }
      ],
      // 控制添加分类对话框显示和隐藏
      addCateDialogVisible: false,
      // 添加分类表单
      addCateForm: {
        // 分类名称
        cat_name: "",
        // 父级分类
        cat_pid: 0,
        // 分类的等级，默认添加的是 1级分类
        cat_level: 0
      },
      // 添加分类表单规则
      addCateFormRules: {
        /* 分类名称 */
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          {
            min: 2,
            max: 7,
            message: "分类名称长度在2-7个字符之间",
            trigger: "blur"
          }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
        expandTrigger:"hover"
      },
      // 选择的父级分类id数组
      selectedKeys: []
    };
  },
  created() {
    // 获取商品分类数据
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }

      // 把数据列表赋值给 catelist
      this.catelist = res.data.result;
      // 为总数据条数 total赋值
      this.total = res.data.total;
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 展示 添加分类对话框
    showAddCateDialog() {
      // 获取父级分类的数据列表
      this.getParentCateList();

      // 关闭对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        // 显示分类二级列表
        params: { type: 2 }
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据列表失败！");
      }
      // 将数据赋值给  parentCateList 父级分类列表
      this.parentCateList = res.data;
    },
    // 父级分类选择项改变出发该函数
    parentCateChanged() {
      console.log(this.selectedKeys);

      // 如果 selectedKeys数组中的length > 0 ，说明选中的父级分类
      // 反之，就说明没有选择父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;

        return;
      } else {
        // 没有选择父级分类
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击按钮添加新的分类
    async addCate() {
      // 验证表单是否全部通过
      this.$refs.addCateFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return; // 验证不通过
        // 验证通过
        // 可以发起添加用户的网络请求

        const { data: res } = await this.$http.post("categories", this.addCateForm);

        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败!");
        }
        this.$message.success("添加分类成功!");
        // 重新获取分类数据
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 监听添加分类对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      // 重置表单
      this.$refs.addCateFormRef.resetFields();
      // 清空 选择的父级分类id数组
      this.selectedKeys = [];
      // 清空添加分类表单
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    } 
  }
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
