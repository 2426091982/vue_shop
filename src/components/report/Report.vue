<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 2. 弄一个容器 -->
      <div id="main" style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1. 导入echarts.min.js
import echarts from "echarts";
// 导入 lodash
import __ from "lodash";
export default {
  data() {
    return {
        // 需要合并的选项
        // 以下都是 eachart 报表的配置
      options: {
        title: {
          text: "用户来源"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3"
            }
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ]
      }
    };
  },
  created() {},
  // 此时，页面上元素，已经被渲染完毕了
  async mounted() {
    // 3.基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById("main"));

    const { data: res } = await this.$http.get("reports/type/1");
    if (res.meta.status !== 200) {
      return this.$message.error("获取数据失败!");
    }

    // 4.指定图表的配置项和数据
    // 合并对象
    const result = __.merge(res.data, this.options);

    // 5.使用刚指定的配置项和数据显示图表。
    myChart.setOption(result);
  },
  methods: {}
};
</script>

<style lang="less" scope></style>
