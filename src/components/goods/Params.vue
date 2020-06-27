<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的次联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTabDate" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tab标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!--输入的文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 参数名称 -->
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <!-- 操作 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTabDate" border stripe>
            <!-- 展开列 -->
             <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tab标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!--输入的文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 参数名称 -->
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <!-- 操作 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数的对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <el-form
          ref="addFormRef"
          :model="addForm"
          label-width="100px"
          :rules="addFormRules"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改参数对话框 -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form
          ref="editFormRef"
          :model="editForm"
          label-width="100px"
          :rules="editFormRules"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 被激活的页签
      activeName: "many",
      // 动态数据
      manyTabDate: [],
      // 静态数据
      onlyTabDate: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        // 添加参数的名称
        attr_name: ""
      },
      // 添加参数的表单规则
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名字",
            trigger: "blur"
          }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {
        // 修改参数的名称
        attr_name: ""
      },
      // 修改参数的表单规则
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名字",
            trigger: "blur"
          }
        ]
      },
      // 控制按钮与文本框的切换显示
      inputVisible: false,
      // 文本框中输入的内容
      inputValue: ""
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    // 如果按钮需要被禁用，则返回true,否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类的ID
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    }
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败!");
      }

      this.catelist = res.data;

      console.log(this.catelist);
    },
    // 级联选择框选中项变化，触发这个函数
    handleChange() {
      // 获取参数列表数据
      this.getParamsData();
    },
    // tab 页签点击事件触发的函数
    handleTabClick() {
      // 获取参数列表数据
      this.getParamsData();
    },
    // 获取参数列表数据
    async getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        /* 如果没有选中 ，清空 */
        this.selectedCateKeys = [];
        this.manyTabDate = [];
        this.onlyTabDate = [];
        return;
      }

      // 证明选中的是三级分类
      //根据所选分类的id,和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];

        // 控制文本框的显示和隐藏
        item.inputVisible = false;
        // 文本框输入的值
        item.inputValue = "";
      });

      /* 判断是静态数据还是动态数据 */
      if (this.activeName === "many") {
        // 动态数据
        this.manyTabDate = res.data;
      } else {
        // 静态数据
        this.onlyTabDate = res.data;
      }
    },
    // 监听添加参数对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加参数
    addParams() {
      // 验证表单是否全部通过
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return; // 验证不通过
        // 验证通过
        // 可以发起添加用户的网络请求

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败!");
        }
        this.$message.success("添加分类成功!");
        // 重新获取分类数据
        this.getParamsData();
        this.addDialogVisible = false;
      });
    },
    // 展示修改参数对话框
    async showEditDialog(attr_id) {
      // 查询参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            /* 是动态参数，还是静态属性 */
            attr_sel: this.activeName
          }
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败!");
      }
      // 获取到的数据赋值
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改参数对话框关闭
    editDialogClosed() {
      // 重置表单
      this.$refs.editFormRef.resetFields();
    },
    // 修改参数
    editParams() {
      // 验证表单是否全部通过
      this.$refs.editFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return; // 验证不通过
        // 验证通过
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            // 新属性的名字
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败!");
        }
        this.$message.success("修改参数成功!");
        // 重新获取分类数据
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    // 根据id 删除对应参数项
    async removeParams(attr_id) {
      console.log(attr_id);
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmResult !== "confirm") {
        // 用户取消了删除的操作
        return this.$message.info("已取消删除！");
      }

      // 用户确认删除，则进行删除
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );

      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败!");
      } else {
        this.$message.success("删除参数成功!");
        this.getParamsData();
      }
    },
    // 文本框失去焦点，或摁下了 Enter都会除发
    async handleInputConfirm(row) {
      // 如果用户没有输入合法的内容，return
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 用户输入了合法的内容
      row.attr_vals.push(row.inputValue.trim());
      /* 清空内容 */
      row.inputValue = "";
      /* 变回按钮 */
      row.inputVisible = false;

    // 保存saveAttrVals的值
      this.saveAttrVals(row);
    },
    // 点击按钮展示文本输入框
    showInput(row) {
      // 控制自己的文本输入框
      row.inputVisible = true;

      // $nextTick 的作用： 就是当页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        // input 输入框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 点击删除tag
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
    // 保存saveAttrVals的值
      this.saveAttrVals(row);
      console.log(row);
    },
    // 保存saveAttrVals的值
    async saveAttrVals(row) {
      /* 发起网络请求 */
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败");
      }

      this.$message.success("修改参数项成功");
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin-top: 15px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
