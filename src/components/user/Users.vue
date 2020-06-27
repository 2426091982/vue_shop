<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->

      <el-row :gutter="20">
        <el-col :span="9">
          <el-input
            placeholder="请输入内容"
            v-model="queryInof.query"
            @clear="getUserList"
            clearable
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户表格 -->
      <el-table :data="users" :border="true" :stripe="true">
        <el-table-column type="index" label="编号"></el-table-column>
        <el-table-column label="用户" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <!-- 提示文字 -->
            <el-tooltip
              effect="dark"
              content="分配用户"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInof.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInof.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <!-- 内容主体区域 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户的对话框 -->
      <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
        <!-- 内容主体区域 -->
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button
            @click="editDialogVisible = false"
            @close="editDialogClosed"
            >取 消</el-button
          >
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配角色对话框 -->
      <el-dialog @close="setRoleDialogClosed" title="提示" :visible.sync="setRoleDialogVisible" width="50%">
        <div>
          <p>当前的用户： {{ userInfo.username }}</p>
          <p>当前的角色：{{ userInfo.role_name }}</p>
          <p>
            分配新角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList "
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="setRoleDialogVisible">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/;

      if (regMobile.test(value)) {
        // 合法的手机号
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      /* 获取用户列表的参数对象 */
      queryInof: {
        /* 查询参数 */
        query: "",
        /* 当前的页数 */
        pagenum: 1,
        /* 每页显示多少数据 */
        pagesize: 2
      },
      /* 用户列表 */
      users: [],
      /* 总数 */
      total: 0,
      //  控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 添加表单的验证规则对象
      addFormRules: {
        /* 用户名 */
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 7,
            message: "用户名长度在3-7个字符之间",
            trigger: "blur"
          }
        ],
        /* 密码 */
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码长度在6-15个字符之间",
            trigger: "blur"
          }
        ],
        /* 邮箱 */
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        /* 电话 */
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        /* 邮箱 */
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        /* 电话 */
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      //  控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: "",
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色id值
      selectedRoleId: '',
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    /* 获取用户列表数据 */
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInof
      });
      console.log(res);
      /* 判断是否获取成功 */
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表数据失败");
      }
      /* 赋值 */
      this.users = res.data.users;
      this.total = res.data.total;
    },
    /* 监听 pagesize 改变的事件 */
    handleSizeChange(newSize) {
      /* 把改变的值赋值给数据 */
      this.queryInof.pagesize = newSize;
      /* 重新获取数据 */
      this.getUserList();
    },
    /* 监听 页码值 改变的事件 */
    handleCurrentChange(newPage) {
      console.log(newPage);
      /* 把改变的值赋值给数据 */
      this.queryInof.pagenum = newPage;
      /* 重新获取数据 */
      this.getUserList();
    },
    /* 监听switch滑块状态的改变 */
    async userStateChanged(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        /* 更新用户失败，设置回原本的样子 */
        userInfo.mg_state = !userInfo.mg_state;
        this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功！");
    },
    /* 监听添加用户对话框的关闭事件 */
    addDialogClosed() {
      // 每次关闭都会重置表单
      this.$refs.addFormRef.resetFields();
    },
    /* 点击按钮添加新用户 */
    addUser() {
      // 验证表单是否全部通过
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return; // 验证不通过
        // 验证通过
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status != 201) {
          this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        // 隐藏对话框
        this.addDialogVisible = false;
        // 刷新用户列表
        this.getUserList();
      });
    },
    /* 展示编辑用户的对话框 */
    async showEditDialog(id) {
      console.log(id);
      const { data: res } = await this.$http.get(`users/${id}`);
      console.log(res);

      if (res.meta.status != 200) {
        return this.$message.error("查询用户信息失败!");
      }
      this.editForm = res.data;
      // 打开对话框
      this.editDialogVisible = true;
    },
    /* 监听修改用户对话框的关闭事件 */
    editDialogClosed() {
      // 重置表单
      this.$refs.editFormRefs.clearValidate();
    },
    // 修改用户信息并提交
    editUserInfo(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return; // 验证不通过

        // 可以发起修改用户的网络请求
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          this.editForm
        );
        if (res.meta.status != 201) {
          this.$message.error("修改用户失败");
        }
        this.$message.success("修改用户成功");
        // 隐藏对话框
        this.editDialogVisible = false;
        // 刷新用户列表
        this.getUserList();
      });
    },
    // 根据id删除对应用户
    async removeUserById(id) {
      // 询问用户是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      // 如果用户确认删除，则返回值为 confirm
      // 如果用户取消删除，则返回值为 cancel
      // console.log(confirmResult);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }

      // 请求删除用户
      const { data: res } = await this.$http.delete(`users/${id}`);

      if (res.meta.status !== 200) {
        console.log(res);
        return this.$message.error("删除用户失败");
      }

      // 重新获取用户列表
      this.getUserList();
      this.$message.success("已经成功删除");
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;

      // 在展示对话框之前，获取所有角色列表

      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }

      // 将结果赋值给rolesList
      this.rolesList = res.data;
      // 展示对话框
      this.setRoleDialogVisible = true;
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      // 如果用户没有选择
      if(!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      
      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
        rid: this.selectedRoleId
      })

      if(res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }

      this.$message.success('更新角色成功!');
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = '';
      this.userInfo = {};
    }
  }
};
</script>

<style lang="less" scoped></style>
