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
          label="姓名"
          prop="name"
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
    <el-drawer
      :title="type==='new'?'新建':'编辑'"
      :visible.sync="dialogVisible"
      size="80%"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="150px" class="demo-ruleForm">
        <el-form-item label="作业题目" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>
        <el-form-item label="指派班级" prop="receive">
          <el-input v-model="ruleForm.receive" />
        </el-form-item>
        <el-form-item
          v-for="(question, index) in ruleForm.questions"
          :key="'question'+index"
          :label="'题目' + question.number"
        >
          <div class="flex align_items_center">
            <el-input v-model="question.value" type="textarea" />
            <el-popconfirm
              title="确定删除吗？"
            >
              <el-button slot="reference" type="danger" @click.prevent="removeQuestion(question)">删除题目</el-button>
            </el-popconfirm>
            <el-dropdown @command="handleCommand">
              <el-button v-if="index===0" type="success">
                添加题目<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="single">单选</el-dropdown-item>
                <el-dropdown-item command="multiple">多选</el-dropdown-item>
                <el-dropdown-item command="write">主观题</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

          </div>
          <div v-for="(option,indexop) in question.options" :key="indexop+'option'" class="flex mt5 align_items_center">
            <span class="nowarp">选项：</span>
            <el-input v-model="option.number" class="w80" />
            <span class="nowarp">选项描述：</span>
            <el-input v-model="option.label" />
            <span class="nowarp">是否是正确答案：</span>
            <el-switch
              v-model="option.right"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
            <el-popconfirm
              title="确定删除吗？"
            >
              <el-button slot="reference" type="danger" @click.prevent="removeOption(index,indexop)">删除选项</el-button>
            </el-popconfirm>
            <el-button v-if="indexop===0" type="success" @click.prevent="addOption(index)">添加选项</el-button>
          </div>

        </el-form-item>

        <span>
          <el-button type="info" @click="submitForm('ruleForm')">存草稿</el-button>
          <el-button type="primary" @click="submitForm('ruleForm')">发 布</el-button>
        </span>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
import { CreateWork, GetWorks, UpdateWork, DeleteWork } from '@/api/apis'
export default {
  name: 'User',
  data() {
    return {
      tableData: [],
      search: '',
      dialogVisible: false,
      ruleForm: {
        name: '', // 作业题目
        questions: [
          {
            number: '1', // 题目编号
            title: '', // 题目信息
            options: [{
              label: '', // 选项信息
              right: false, // 是否是正确答案
              number: 'A' // 选项编号
            }],
            answer: [],
            type: 'danxuan'// danxuan/duoxuan/zhuguan
          }
        ],
        creater: '', // 发布人
        create_time: '', // 创建时间
        receive: '', // 班级列表ids
        status: ''// 0 过期 1发布。2草稿
      },
      rules: {
        name: [
          { required: true, message: '请输入作业名称', trigger: 'blur' }
        ],
        receive: [
          { required: true, message: '请选择指派班级', trigger: 'blur' }
        ],
        reps: [
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
        skip: this.pageSize * (this.currentPage - 1),
        limit: this.pageSize,
        query: JSON.stringify({ type: 'teacher' })
      }
      GetWorks(obj).then(res => {
        const { items, total_count } = res
        this.tableData = items
        this.total = total_count
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
          DeleteWork({ id: row.id }).then(
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
            CreateWork({ body: this.ruleForm }).then(
              res => {
                this.$message.success(' 创建成功')
                this.query()
                this.dialogVisible = false
              }
            )
          } else {
            UpdateWork({ id: this.ruleForm._id }, this.ruleForm).then(
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
    },
    handleCommand(e) {
      if (e === 'single') {
        this.ruleForm.questions.push({
          title: '', // 题目信息
          number: this.ruleForm.questions.length + 1, // 题目编号
          options: [{
            label: '', // 选项信息
            right: false,
            number: 'A' // 选项编号
          }],
          type: 'single'// danxuan/duoxuan/zhuguan
        })
      } else if (e === 'multiple') {
        this.ruleForm.questions.push({
          title: '', // 题目信息
          number: this.ruleForm.questions.length + 1, // 题目编号
          options: [{
            label: '', // 选项信息
            right: false,
            number: 'A' // 选项编号
          }],
          type: 'multiple'// danxuan/duoxuan/zhuguan
        })
      } else {
        this.ruleForm.questions.push({
          title: '', // 题目信息
          number: this.ruleForm.questions.length + 1, // 题目编号
          type: 'write'// danxuan/duoxuan/zhuguan
        })
      }
    },

    removeQuestion(item) {
      var index = this.ruleForm.questions.indexOf(item)
      if (index !== -1) {
        this.ruleForm.questions.splice(index, 1)
      }
    },
    removeOption(q, o) {
      this.ruleForm.questions[q].options.splice(o, 1)
    },
    addOption(q) {
      const keyMap = {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D',
        4: 'E',
        5: 'F',
        6: 'G',
        7: 'H',
        8: 'I'
      }
      this.ruleForm.questions[q].options.push({
        label: '', // 选项信息
        number: keyMap[this.ruleForm.questions[q].options.length] // 选项编号
      })
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
