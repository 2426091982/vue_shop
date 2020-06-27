<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 消息提示 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :active="Number(activeIndex)"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="图片内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--Tab栏-->
      <el-form
        ref="addFormRef"
        :rules="addFormRules"
        :model="addForm"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <!-- 级联选择器 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in this.manyTabData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTabData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传组件 -->
            <!-- action表示图片要上传到的后台API地址 -->
            <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="successLoad"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="图片内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>

            <!-- 添加商品按钮 -->
            <el-button type="primary" @click="add" class="addBtn">添加用户</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片详情对话框 -->
    <el-dialog
      title="图片详情"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <img :src="PreviewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash
import _ from 'lodash'

export default {
  data() {
    return {
      // 步骤条进度
      activeIndex: 0,
      // 添加商品表单
      addForm: {
        // 商品名称
        goods_name: "",
        // 商品价格
        goods_price: '0',
        // 商品重量
        goods_weight: '0',
        // 商品数量
        goods_number: '0',
        // 选中的分类列表
        goods_cat: [],
        // 上传的图片临时路径
        pics: [],
        // 商品介绍
        goods_introduce: "",
        // 商品 参数/属性
        attrs:[],
      },
      // 添加商品表单规则
      addFormRules: {
        /* 商品名称 */
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            tigger: "blur"
          }
        ],
        /* 商品价格 */
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            tigger: "blur"
          }
        ],
        /* 商品重量 */
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            tigger: "blur"
          }
        ],
        /* 商品数量 */
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            tigger: "blur"
          }
        ]
      },
      // 商品分类数据
      cateList: [],
      // 级联选择器配置
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      // 商品动态参数
      manyTabData: [],
      // 商品静态属性
      onlyTabData: [],
      // 上传图片的url地址
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      // 设置上传图片组件的请求头,手动添加token
      headerObj: {
        // 为请求头添加 Authorization字段携带 token
        Authorization: window.sessionStorage.getItem("token")
      },
      // 显示图片对话框
      previewDialogVisible: false,
      // 图片路径
      PreviewPath: ""
    };
  },
  created() {
    // 获取商品分类数据
    this.getCateList();
  },
  computed: {
    // 当前三级分类id
    cateID() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败!");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    // 级联选择器发生改变触发
    handleChange() {
      console.log(this.addForm.goods_cat);

      if (this.addForm.goods_cat.length !== 3) {
        // 如果没有选择三级分类直接清空数组
        this.addForm.goods_cat = [];
      }
    },
    // 当tab栏切换的时候
    beforeTabLeave(active, old) {
      // 判断是否选择了分类列表
      if (old == 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类!");
        // 阻止切换
        return false;
      }
    },
    // tab被选中的时候触发
    async tabClicked() {
      console.log(this.activeIndex);
      // 访问的是动态参数面板
      if (this.activeIndex == 1) {
        const { data: res } = await this.$http.get(
          `categories/${this.cateID}/attributes`,
          {
            params: {
              sel: "many"
            }
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("获取商品参数失败！");
        }
        // 获取到赋值 商品参数
        this.manyTabData = res.data;

        this.manyTabData.forEach(item => {
          // 如果没有参数
          if (item.attr_vals.length === 0) {
            item.attr_vals = [];
          }
          item.attr_vals = item.attr_vals.split(" ");
        });
        console.log(this.manyTabData);
      } else if (this.activeIndex == 2) {
        // 访问的是静态属性
        const { data: res } = await this.$http.get(
          `categories/${this.cateID}/attributes`,
          {
            params: {
              sel: "only"
            }
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("获取商品参数失败！");
        }

        this.onlyTabData = res.data;
        console.log(this.onlyTabData);
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.PreviewPath = file.response.data.url;
      console.log(this.PreviewPath);
      // 显示图片详情对话框
      this.previewDialogVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 从pics数组中找到这个图片的对应索引值
      const index = this.addForm.pics.findIndex(item => {
        return item.pic == filePath;
      });
      // 删除数组中这个图片
      this.addForm.pics.splice(index, 1);
      console.log(this.addForm.pics);
    },
    // 上传图片成功事件
    successLoad(res) {
      // 1.拼接得到一个图片信息对象
      let picInfo = {
        pic: res.data.tmp_path
      };
      // 2.把得到的对象添加到picInfo 数组
      this.addForm.pics.push(picInfo);
      console.log(this.addForm.pics);
    },
    // 点击按钮添加用户
   async  add() {
      // 验证表单是否符合验证
      this.$refs.addFormRef.validate(valid => {
        if(!valid) {
          // 表单验证失败
          return this.$message.error('请填写必要的表单')
        }
      })
      console.log(this.addForm);

      // 克隆addForm
      const from = _.cloneDeep(this.addForm);
      from.goods_cat = from.goods_cat.join(',')

      // 处理动态参数
      this.manyTabData.forEach(item => {
        const Info = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join('')
        }
        /* 添加商品的参数 */
        this.addForm.attrs.push(Info);
      })

      // 处理静态属性
      this.onlyTabData.forEach(item => {
        const Info = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        /* 添加商品的参数 */
        this.addForm.attrs.push(Info);
      })

      from.attrs = this.addForm.attrs;

      // 发起网络请求
      const {data: res} = await this.$http.post('/goods',from);
      console.log(res);
      if(res.meta.status !== 201) {
        return this.$message.error("添加商品失败");
      }
      this.$message.success('添加商品成功');
      this.$router.push('/goods');
      console.log(from);
    }
  }
};
</script>

<style lang="less" scope>
.el-steps {
  margin-top: 15px;
  margin-bottom: 30px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.addBtn {
  margin-top: 20px !important;
}
</style>
