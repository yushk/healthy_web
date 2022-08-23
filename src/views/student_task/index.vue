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
        <el-button type="primary" size="small" @click="dialogVisible = true">搜索</el-button>
        <el-button type="success" size="small" @click="dialogVisible = true; type='new'">新建</el-button>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%;height:70vh"
      >
        <el-table-column
          label="用户名"
          prop="username"
        />
        <el-table-column
          label="电话"
          prop="phone"
        />
        <el-table-column
          label="角色"
          prop="role"
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
    <el-dialog
      :title="type==='new'?'新建':'编辑'"
      :visible.sync="dialogVisible"
      width="40%"
      :before-close="handleClose"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="150px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="ruleForm.username" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="ruleForm.phone" :disabled="type==='edit'" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="ruleForm.password" show-password auto-complete="new-password" />
        </el-form-item>
        <el-form-item label="再次输入密码" prop="repassword">
          <el-input v-model="ruleForm.repassword" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="ruleForm.role" multiple placeholder="请选择用户角色">
            <el-option label="admin" value="root" />
            <el-option label="游客" value="user" />
          </el-select>
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
import { createUser, getUsers, updateUser, delUser } from '@/api/user'
export default {
  name: 'User',
  data() {
    return {
      tableData: [],
      search: '',
      dialogVisible: false,
      ruleForm: {
        username: '',
        phone: '',
        password: '',
        repassword: '',
        role: ['root']
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        repassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { min: 11, max: 11, message: '11位手机号码', trigger: 'blur' }
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
    query() {
      var obj = {
        currentpage: this.currentPage,
        perpage: this.pageSize,
        like: {}
      }
      getUsers(obj).then(res => {
        const { data, count } = res
        this.tableData = data
        this.total = count
      })
    },
    handleEdit(index, row) {
      this.type = 'edit'
      this.ruleForm = Object.assign({ repassword: '' }, row)
      this.ruleForm.password = ''
      this.dialogVisible = true
      console.log(index, row)
      console.log('this.ruleForm', this.ruleForm)
    },
    handleDelete(index, row) {
      console.log(index, row)
      this.$confirm('确认删除该用户？')
        .then(_ => {
          delUser({ id: row._id }).then(
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
            createUser(this.ruleForm).then(
              res => {
                this.$message.success(' 创建成功')
                this.query()
                this.dialogVisible = false
              }
            )
          } else {
            updateUser({ id: this.ruleForm._id }, this.ruleForm).then(
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
    justify-content: flex-start;
  }
}
</style>
