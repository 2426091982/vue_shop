<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100px">
        </el-table-column>
        <el-table-column label="创建时间" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGood(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区月 -->
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        /* 查询对象 */
        query: "",
        /* 当前页码 */
        pagenum: 1,
        /* 展示多少数据 */
        pagesize: 10
      },
      // 商品列表数据
      goodsList: [],
      // 总数据条数
      total: 0
    };
  },
  created() {
    // 获取列表数据
    this.getGoodsList();
  },
  methods: {
    // 根据分页获取商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品数据列表失败!");
      }

      this.goodsList = res.data.goods;
      this.total = res.data.total;
      console.log(res);
    },
    // 监听分页size改变
    handleSizeChange(newSize) {
      // 替换展示新数据条数
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // 监听页码改变
    handleCurrentChange(newNum) {
      // 替换新页码
      this.queryInfo.pagenum = newNum;
      this.getGoodsList();
    },
    // 根据id删除商品
    async removeGood(goods_id) {
      const result = await this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      
      if(result !== 'confirm') {
        // 用户取消删除
        return this.$message.info('已取消删除');
      }
      const {data: res} = await this.$http.delete(`goods/${goods_id}`)

      if(res.meta.status !== 200){
        return this.$message.error('删除商品数据失败!');
      }
      this.$message.success('删除商品成功!');
      this.getGoodsList();
    },
    // 跳转到添加商品界面
    addGoodsPage() {
      this.$router.push('/goods/add');
    }
  }
};
</script>

<style lang="less" scope></style>
