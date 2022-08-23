<template>
  <div class="container">
    <el-card>
      <div class="top">

        <el-input
          v-model="search"
          size="small"
          placeholder="输入关键字搜索"
          class="searchinput"
          @keyup.native.enter="searchfunc"
        />
        <el-button type="primary" size="small" @click="searchfunc">搜索</el-button>
        <el-button type="success" size="small" @click="dialogVisible = true; type='new'">新建</el-button>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%;height:70vh;overflow-y:auto"
      >
        <el-table-column
          label="编号"
          prop="code"
          width="100px"
        />
        <el-table-column
          label="问题"
          prop="label"
        />
        <el-table-column
          label="答案"
          prop="answer"
          width="200px"
        >
          <template slot-scope="scope">
            <span v-html="printAnswer(scope.row.answer)" />
          </template>
        </el-table-column>
        <el-table-column
          label="更新时间"
          prop="updateTime"
          width="200px"
        >
          <template slot-scope="scope">
            {{ parseTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200px"
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
        <el-form-item label="编号" prop="code">
          <el-input v-model="ruleForm.code" :disabled="type==='edit'" />
        </el-form-item>
        <el-form-item label="问题" prop="label">
          <el-input
            v-model="ruleForm.label"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item
          v-for="(answer, index) in ruleForm.answer"
          :key="'answer'+index"
          :label="'答案' + (index+1)"
        >
          <el-input
            v-model="answer.label"
            size="small"
            placeholder="输入答案名称"
            class="searchinput"
          />
          跳转到：
          <el-input
            v-model="answer.code"
            size="small"
            placeholder="输入跳转题目编号"
            class="searchinput"
          />
          <el-button size="small" type="danger" @click.prevent="removeDomain(answer)">删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" size="small" @click="addDomain">新增答案</el-button>
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
import Service from '@/api/question'
import { parseTime } from '@/utils/index'
export default {
  name: 'Profession',
  data() {
    return {
      parseTime,
      tableData: [],
      search: '',
      dialogVisible: false,
      ruleForm: {
        label: '',
        code: '',
        answer: [
          {
            label: '',
            code: ''
          }
        ]
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
      type: 'new',
      dicType: 'mettle'
    }
  },
  watch: {
    dialogVisible(v) {
      if (!v) {
        this.ruleForm = {
          label: '',
          code: '',
          answer: [
            {
              label: '',
              code: ''
            }
          ]
        }
      }
    }
  },
  mounted() {
    this.query()
  },
  methods: {
    removeDomain(item) {
      var index = this.ruleForm.answer.indexOf(item)
      if (index !== -1) {
        this.ruleForm.answer.splice(index, 1)
      }
    },
    printAnswer(d) {
      var s = ''
      d.forEach(e => {
        s += e.label + '->' + e.code + '<br>'
      })
      return s
    },
    addDomain() {
      this.ruleForm.answer.push({
        label: '',
        code: ''
      })
    },
    searchfunc() {
      this.currentPage = 1
      this.query()
    },
    query() {
      var obj = {
        currentpage: this.currentPage,
        perpage: this.pageSize,
        like: JSON.stringify({ type: this.dicType, label: {
          $regex: this.search,
          $options: 'i'
        }})
      }
      Service.list(obj).then(res => {
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
          Service.del({ id: row._id }).then(
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
            var d = Object.assign(this.ruleForm, { type: this.dicType })
            Service.add(d).then(
              res => {
                this.$message.success(' 创建成功')
                this.query()
                this.dialogVisible = false
              }
            )
          } else {
            Service.update({ id: this.ruleForm._id }, Object.assign(this.ruleForm, { type: this.dicType })).then(
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
