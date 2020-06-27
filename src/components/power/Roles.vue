<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-button type="primary" @click="addDialogVisible = true"
          >添加用户</el-button
        >
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" :border="true" :stripe="true">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="编号"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="290px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色对话框 -->
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
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改角色的对话框 -->
      <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%">
        <!-- 内容主体区域 -->
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
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

      <!-- 分配权限对话框 -->

      <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
        <!-- 树形控件 -->
        <el-tree ref="treeRef" :data="rightList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights"
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
    return {
      // 所有角色列表数据
      rolelist: [],
      //  控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改角色对话框的显示与隐藏
      editDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        // 角色名称
        roleName: "",
        // 角色描述
        roleDesc: ""
      },
      // 添加角色表单的验证规则对象
      addFormRules: {
        /* 角色名称 */
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 1,
            max: 7,
            message: "角色名称长度在1-7个字符之间",
            trigger: "blur"
          }
        ],
        /* 角色描述 */
        roleDesc: [
          { required: false, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 6,
            message: "角色描述在2-6个字符之间",
            trigger: "blur"
          }
        ]
      },
      // 修改角色的表单数据
      editForm: {
        // 角色名称
        roleName: "",
        // 角色描述
        roleDesc: "",
        //用户id
        id: ""
      },
      // 修改角色表单的验证规则对象
      editFormRules: {
        /* 角色名称 */
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 1,
            max: 7,
            message: "角色名称长度在1-7个字符之间",
            trigger: "blur"
          }
        ],
        /* 角色描述 */
        roleDesc: [
          { required: false, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 6,
            message: "角色描述在2-6个字符之间",
            trigger: "blur"
          }
        ]
      },
      // 是否展示分配权限对话框
      setRightDialogVisible: false,
      // 权限列表
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps:{
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 即将分配权限的角色id
      roleId: ''
    };
  },
  created() {
    // 获取所有角色的列表
    this.getRolesList();
  },
  methods: {
    /* 获取所有角色的列表 */
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("获取列表数据失败");
      }
      // 赋值
      this.rolelist = res.data;
      console.log(this.rolelist);
    },
    // 添加用户
    addUser() {
      // 验证表单是否全部通过
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return; // 验证不通过
        // 验证通过
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status != 201) {
          this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        // 隐藏对话框
        this.addDialogVisible = false;
        // 刷新角色列表
        this.getRolesList();
      });
    },
    /* 监听添加用户对话框的关闭事件 */
    addDialogClosed() {
      // 每次关闭都会重置表单
      this.$refs.addFormRef.resetFields();
    },
    /* 监听修改用户对话框的关闭事件 */
    editDialogClosed() {
      // 每次关闭都会重置表单
      this.$refs.editFormRef.resetFields();
    },
    //展示修改对话框
    async showEditDialog(id) {
      // 绑定值
      this.editForm.id = id;

      const { data: res } = await this.$http.get(`roles/${id}`);

      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }

      this.editForm.roleName = res.data.roleName;
      this.editForm.roleDesc = res.data.roleDesc;
      console.log(this.editForm);
      // 展示修改角色对话框
      this.editDialogVisible = true;
    },
    // 修改角色
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return; // 验证不通过

        // 可以发起修改用户的网络请求
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.id}`,
          this.editForm
        );
        if (res.meta.status != 201) {
          this.$message.error("修改角色失败");
        }
        this.$message.success("修改角色成功");
        // 隐藏对话框
        this.editDialogVisible = false;
        // 刷新用户列表
        this.getRolesList();
      });
    },
    // 根据id删除角色
    async removeUserById(id) {
      // 询问用户是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色",
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
      const { data: res } = await this.$http.delete(`roles/${id}`);

      if (res.meta.status !== 200) {
        console.log(res);
        return this.$message.error("删除角色失败");
      }

      // 重新获取用户列表
      this.getRolesList();
      this.$message.success("已经成功删除");
    },
    /* 根据id删除对应的权限 */
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限",
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
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败!");
      }
      /* 重新获取数据
      this.getRolesList(); */
      // 只重新赋值修改的权限用户 提升用户体验，不刷新权限页面
      role.children = res.data;
      this.$message.success("删除权限成功!");
    },
    // 显示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      //发送请求
      const {data: res} = await this.$http.get('rights/tree');
      if(res.meta.status !== 200){
        return this.$message.error('获取分配权限失败!');
      }
      // 赋值权限列表
      this.rightList = res.data;
      console.log(this.rightList);

      // 递归获取三级节点的id
      this.getLeafKeys(role,this.defKeys)
      // 展示对话框
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id,并保存到 defKeys数组中
    getLeafKeys(node,arr) {
      if(!node.children){
        // 如果当前node节点不包括，children属性则是三级节点
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item,arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      // 清空defKeys 数组
      this.defKeys = [];
    },
    // 点击为角色分配权限
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];

      console.log(keys)
      const idStr = keys.join(',')

      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`,{
        rids: idStr
      })

      if(res.meta.status !== 200){
        return this.$message.error('分配角色权限失败!');
      }

      this.$message.success('分配角色权限成功!')
      // 重新刷新列表
      this.getRolesList();
      // 隐藏对话框
      this.setRightDialogVisible = false
    }
  }
};
</script>

<style lang="less" scope>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
/* 垂直居中样式 */
.vcenter {
  display: flex;
  align-items: center;
}
</style>
