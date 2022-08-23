<template>
  <div class="container">
    <el-card>
      <div class="top">

        <el-input
          v-model="search"
          size="small"
          placeholder="输入关键字搜索"
          class="searchinput"
        />
        <el-button type="primary" size="small" @click="query">搜索</el-button>
        <el-button type="success" size="small" @click="dialogVisible = true; type='new'">新建</el-button>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%;height:70vh"
      >
        <el-table-column
          label="年级"
          prop="grade"
        />
        <el-table-column
          label="学院"
          prop="faculty"
        />
        <el-table-column
          label="专业"
          prop="subject"
        />
        <el-table-column
          label="班级"
          prop="number"
        />
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
      />
    </el-card>
    <el-drawer
      :title="type==='new'?'新建':'编辑'"
      :visible.sync="dialogVisible"
      size="40%"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="150px" class="demo-ruleForm">
        <el-form-item label="年级" prop="grade">
          <el-date-picker
            v-model="ruleForm.grade"
            type="year"
            format="yyyy"
            value-format="yyyy"
            placeholder="选择年级"
          />
        </el-form-item>
        <el-form-item label="学院" prop="faculty">
          <el-input v-model="ruleForm.faculty" />
        </el-form-item>
        <el-form-item label="专业" prop="subject">
          <el-input v-model="ruleForm.subject" />
        </el-form-item>
        <el-form-item label="班级" prop="number">
          <el-input v-model="ruleForm.number" />
        </el-form-item>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
        </span>
      </el-form>
    </el-drawer>

  </div>
</template>

<script>
import { GetClasses, CreateClass, DeleteClass, UpdateClass } from '@/api/apis'
export default {
  name: 'User',
  data() {
    return {
      tableData: [],
      search: '',
      dialogVisible: false,
      ruleForm: { // 班级信息
        grade: '', // 年级
        faculty: '', // 学院/系
        subject: '', // 专业
        number: '' // 班级
      },
      rules: {
        grade: [
          { required: true, message: '请选择年级', trigger: 'blur' }
        ],
        faculty: [
          { required: true, message: '请输入学院/系', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请输入专业', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '请输入班级', trigger: 'blur' }
        ]
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      type: 'new',
      drawer: false,
      innerDrawer: false
    }
  },
  mounted() {
    this.query()
  },
  methods: {
    query() {
      var obj = {
        skip: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize,
        query: ''
      }
      GetClasses(obj).then(res => {
        const { items, total_count } = res
        this.tableData = items
        this.total = total_count
      })
    },
    handleEdit(index, row) {
      this.type = 'edit'
      this.ruleForm = Object.assign({ }, row)
      this.dialogVisible = true
      console.log('this.ruleForm', this.ruleForm)
    },
    handleDelete(index, row) {
      console.log(index, row)
      this.$confirm('确认删除班级？')
        .then(_ => {
          DeleteClass({ id: row.id }).then(
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
            CreateClass({ body: this.ruleForm }).then(
              res => {
                this.$message.success(' 创建成功')
                this.query()
                this.dialogVisible = false
                this.resetForm('ruleForm')
              }
            )
          } else {
            const id = this.ruleForm.id
            delete this.ruleForm.id

            UpdateClass({ id: id, body: this.ruleForm }).then(
              res => {
                this.$message.success('编辑成功')
                this.query()
                this.dialogVisible = false
                this.resetForm('ruleForm')
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
    justify-content: flex-start;
  }
}
</style>
