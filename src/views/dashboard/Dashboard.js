import React, { useEffect, useState, useRef } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CPagination, CPaginationItem } from '@coreui/react'

const Dashboard = () => {
  const [signupLogs, setSignupLogs] = useState([])
  const [loginLogs, setLoginLogs] = useState([])
  const [logoutLogs, setLogoutLogs] = useState([])

  const [signupPage, setSignupPage] = useState(1)
  const [loginPage, setLoginPage] = useState(1)
  const [logoutPage, setLogoutPage] = useState(1)
  const itemsPerPage = 10 // 페이지당 항목 개수

  const chartRef = useRef(null)

  // 서버에서 로그 데이터를 가져오는 함수들
  const fetchSignUpLogs = async () => {
    try {
      const response = await fetch('http://125.132.216.190:12450/api/logs/signup')
      const data = await response.json()
      setSignupLogs(data.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))) // 최신순 정렬
    } catch (error) {
      console.error('Error fetching sign-up logs:', error)
    }
  }

  const fetchLoginLogs = async () => {
    try {
      const response = await fetch('http://125.132.216.190:12450/api/logs/login')
      const data = await response.json()
      setLoginLogs(data.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))) // 최신순 정렬
    } catch (error) {
      console.error('Error fetching login logs:', error)
    }
  }

  const fetchLogoutLogs = async () => {
    try {
      const response = await fetch('http://125.132.216.190:12450/api/logs/logout')
      const data = await response.json()
      setLogoutLogs(data.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))) // 최신순 정렬
    } catch (error) {
      console.error('Error fetching logout logs:', error)
    }
  }

  useEffect(() => {
    fetchSignUpLogs()
    fetchLoginLogs()
    fetchLogoutLogs()

    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [])

  // 날짜별로 로그 카운트를 계산하는 함수
  const getLogCountsByDate = (logs) => {
    const counts = {}
    logs.forEach(log => {
      const date = new Date(log.eventTime).toLocaleDateString()
      counts[date] = (counts[date] || 0) + 1
    })
    return counts
  }

  const signUpCounts = getLogCountsByDate(signupLogs)
  const loginCounts = getLogCountsByDate(loginLogs)
  const logoutCounts = getLogCountsByDate(logoutLogs)

  // 날짜를 최신순으로 정렬 (내림차순)
  const labels = Object.keys({ ...signUpCounts, ...loginCounts, ...logoutCounts }).sort((a, b) => new Date(a) - new Date(b))

  // 현재 페이지에 해당하는 로그만 필터링
  const getPaginatedLogs = (logs, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return logs.slice(startIndex, endIndex)
  }

  const totalPages = (logs) => Math.ceil(logs.length / itemsPerPage)

  // 페이지 범위 계산
  const getPaginationRange = (currentPage, totalPageCount) => {
    const minPageNumber = Math.max(1, currentPage - 2)
    const maxPageNumber = Math.min(minPageNumber + 4, totalPageCount)
    return Array.from({ length: maxPageNumber - minPageNumber + 1 }, (_, idx) => minPageNumber + idx)
  }

  return (
    <div>
      <h4>로그 통계</h4> {/* Log Statistics -> 로그 통계 */}
      <CChartLine
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels: labels,  // 최신 날짜가 오른쪽
          datasets: [
            {
              label: '회원가입 로그', // Sign-Up Logs -> 회원가입 로그
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-info'),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: labels.map(label => signUpCounts[label] || 0),
              fill: true,
            },
            {
              label: '로그인 로그', // Login Logs -> 로그인 로그
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-success'),
              pointHoverBackgroundColor: getStyle('--cui-success'),
              borderWidth: 2,
              data: labels.map(label => loginCounts[label] || 0),
            },
            {
              label: '로그아웃 로그', // Logout Logs -> 로그아웃 로그
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-danger'),
              pointHoverBackgroundColor: getStyle('--cui-danger'),
              borderWidth: 2,
              data: labels.map(label => logoutCounts[label] || 0),
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              ticks: {
                color: getStyle('--cui-body-color'),
                maxTicksLimit: 5,
              },
            },
          },
        }}
      />

      {/* 회원가입 로그 */}
      <h4>회원가입 로그</h4>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>이벤트 유형</CTableHeaderCell> {/* Event Type -> 이벤트 유형 */}
            <CTableHeaderCell>사용자 이메일</CTableHeaderCell> {/* User Email -> 사용자 이메일 */}
            <CTableHeaderCell>IP 주소</CTableHeaderCell> {/* IP Address -> IP 주소 */}
            <CTableHeaderCell>이벤트 시간</CTableHeaderCell> {/* Event Time -> 이벤트 시간 */}
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {getPaginatedLogs(signupLogs, signupPage).map((log, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{log.eventType}</CTableDataCell>
              <CTableDataCell>{log.userEmail}</CTableDataCell>
              <CTableDataCell>{log.ipAddress}</CTableDataCell>
              <CTableDataCell>{new Date(log.eventTime).toLocaleString()}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      <CPagination className="justify-content-center">
        <CPaginationItem
          disabled={signupPage === 1}
          onClick={() => setSignupPage(signupPage - 1)}
        >
          이전
        </CPaginationItem>
        {getPaginationRange(signupPage, totalPages(signupLogs)).map((pageNum) => (
          <CPaginationItem
            key={pageNum}
            active={signupPage === pageNum}
            onClick={() => setSignupPage(pageNum)}
          >
            {pageNum}
          </CPaginationItem>
        ))}
        <CPaginationItem
          disabled={signupPage === totalPages(signupLogs)}
          onClick={() => setSignupPage(signupPage + 1)}
        >
          다음
        </CPaginationItem>
      </CPagination>

      {/* 로그인 로그 */}
      <h4>로그인 로그</h4>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>이벤트 유형</CTableHeaderCell>
            <CTableHeaderCell>사용자 이메일</CTableHeaderCell>
            <CTableHeaderCell>IP 주소</CTableHeaderCell>
            <CTableHeaderCell>이벤트 시간</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {getPaginatedLogs(loginLogs, loginPage).map((log, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{log.eventType}</CTableDataCell>
              <CTableDataCell>{log.userEmail}</CTableDataCell>
              <CTableDataCell>{log.ipAddress}</CTableDataCell>
              <CTableDataCell>{new Date(log.eventTime).toLocaleString()}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      <CPagination className="justify-content-center">
        <CPaginationItem
          disabled={loginPage === 1}
          onClick={() => setLoginPage(loginPage - 1)}
        >
          이전
        </CPaginationItem>
        {getPaginationRange(loginPage, totalPages(loginLogs)).map((pageNum) => (
          <CPaginationItem
            key={pageNum}
            active={loginPage === pageNum}
            onClick={() => setLoginPage(pageNum)}
          >
            {pageNum}
          </CPaginationItem>
        ))}
        <CPaginationItem
          disabled={loginPage === totalPages(loginLogs)}
          onClick={() => setLoginPage(loginPage + 1)}
        >
          다음
        </CPaginationItem>
      </CPagination>

      {/* 로그아웃 로그 */}
      <h4>로그아웃 로그</h4>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>이벤트 유형</CTableHeaderCell>
            <CTableHeaderCell>사용자 이메일</CTableHeaderCell>
            <CTableHeaderCell>IP 주소</CTableHeaderCell>
            <CTableHeaderCell>이벤트 시간</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {getPaginatedLogs(logoutLogs, logoutPage).map((log, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{log.eventType}</CTableDataCell>
              <CTableDataCell>{log.userEmail}</CTableDataCell>
              <CTableDataCell>{log.ipAddress}</CTableDataCell>
              <CTableDataCell>{new Date(log.eventTime).toLocaleString()}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      <CPagination className="justify-content-center">
        <CPaginationItem
          disabled={logoutPage === 1}
          onClick={() => setLogoutPage(logoutPage - 1)}
        >
          이전
        </CPaginationItem>
        {getPaginationRange(logoutPage, totalPages(logoutLogs)).map((pageNum) => (
          <CPaginationItem
            key={pageNum}
            active={logoutPage === pageNum}
            onClick={() => setLogoutPage(pageNum)}
          >
            {pageNum}
          </CPaginationItem>
        ))}
        <CPaginationItem
          disabled={logoutPage === totalPages(logoutLogs)}
          onClick={() => setLogoutPage(logoutPage + 1)}
        >
          다음
        </CPaginationItem>
      </CPagination>
    </div>
  )
}

export default Dashboard
