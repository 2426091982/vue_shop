<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/login.jpg" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reseLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456"
      },
      loginFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 1, max: 15, message: "长度在 5 到 15 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    /* 点击重置按钮，重置登录表单 */
    reseLoginForm() {
      console.log(this);
      // 重置回初始值
      this.$refs.loginFormRef.resetFields();
    },
    /* 登录 */
    login() {
      // 调用表单验证方法
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status != 200) {
          return this.$message.error("登录失败");
        }
        this.$message.success("登录成功");
        // 1. 将登录成功之后的token,保存到客户端的 sessionStorage中
        // 1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
        // 1.2 token只应该、当在当前网站打开期间生效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem("token", res.data.token);
        // 2. 通过编程式导航跳转到后台主页，路由器地址是 /home
        this.$router.push("/home");
      });
    }
  }
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 5px 5px 10px #333;
    .avatar_box {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      border: 1px solid #eee;
      padding: 10px;
      box-shadow: 0 0 10px #333;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        border-radius: 50%;
        background-color: #ddd;
      }
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px 15px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
