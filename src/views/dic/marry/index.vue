<template>
  <div class="container">
    <el-card>
      <div class="top">

        <el-input
          v-model="searchVal"
          size="small"
          placeholder="输入关键字搜索"
          class="searchinput"
          @keyup.native.enter="search()"
        />
        <el-button type="primary" size="small" @click="search()">搜索</el-button>
        <el-button type="success" size="small" @click="dialogVisible = true; type='new'">新建</el-button>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%;height:70vh"
      >
        <el-table-column
          label="名称"
          prop="label"
        />
        <el-table-column
          label="编码"
          prop="code"
        />
        <el-table-column
          label="描述"
          prop="desc"
        />
        <el-table-column
          label="更新时间"
          prop="updateTime"
        >
          <template slot-scope="scope">
            {{ parseTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
            >Edit</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="changePage"
      />
    </el-card>
    <el-dialog
      :title="type==='new'?'新建':'编辑'"
      :visible.sync="dialogVisible"
      width="40%"
      :before-close="handleClose"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="150px" class="demo-ruleForm">
        <el-form-item label="名称" prop="label">
          <el-input v-model="ruleForm.label" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="ruleForm.code" :disabled="type==='edit'" />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="ruleForm.desc" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import marryService from '@/api/dic'
import { parseTime } from '@/utils/index'
export default {
  name: 'Marry',
  data() {
    return {
      parseTime,
      tableData: [],
      searchVal: '',
      dialogVisible: false,
      ruleForm: {
        lael: '',
        code: '',
        desc: ''
      },
      rules: {
        label: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ]
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      type: 'new'
    }
  },
  mounted() {
    this.query()
  },
  methods: {
    search() {
      this.currentPage = 1
      this.query()
    },
    query() {
      var obj = {
        currentpage: this.currentPage,
        perpage: this.pageSize,
        like: JSON.stringify({ type: 'marry', label: {
          $regex: this.searchVal,
          $options: 'i'
        }})
      }
      marryService.list(obj).then(res => {
        const { data, count } = res
        this.tableData = data
        this.total = count
      })
    },
    changePage(v) {
      this.currentPage = v
      this.query()
    },
    handleEdit(index, row) {
      this.type = 'edit'
      this.ruleForm = JSON.parse(JSON.stringify(row))
      this.ruleForm.repassword = ''
      this.ruleForm.password = ''

      this.dialogVisible = true
      console.log(index, row)
    },
    handleDelete(index, row) {
      console.log(index, row)
      this.$confirm('确认删除该条数据？')
        .then(_ => {
          marryService.del({ id: row._id }).then(
            res => {
              this.$message.success('删除成功')
              this.query()
            }
          )
        })
        .catch(_ => {})
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.type === 'new') {
            var d = Object.assign(this.ruleForm, { type: 'marry' })
            marryService.add(d).then(
              res => {
                this.$message.success(' 创建成功')
                this.query()
                this.dialogVisible = false
              }
            )
          } else {
            marryService.update({ id: this.ruleForm._id }, Object.assign(this.ruleForm, { type: 'marry' })).then(
              res => {
                this.$message.success('编辑成功')
                this.query()
                this.dialogVisible = false
              }
            )
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
<style lang="scss" scoped>
.container{
  .top{
    display: flex;
    justify-content: start;
  }
}
</style>
