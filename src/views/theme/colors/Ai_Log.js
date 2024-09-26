import React, { useEffect, useState } from 'react';
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CPagination, CPaginationItem } from '@coreui/react';

const Dashboard = () => {
  const [aiLogs, setAiLogs] = useState([]);
  const [aiPage, setAiPage] = useState(1);
  const itemsPerPage = 10;

  // AI 로그 데이터를 페이지별로 나누는 함수
  const getPaginatedLogs = (logs, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return logs.slice(startIndex, endIndex);
  };

  // 총 페이지 수 계산하는 함수
  const totalPages = (logs) => {
    return Math.ceil(logs.length / itemsPerPage);
  };

  // AI 로그 데이터를 서버에서 가져오는 함수
  const fetchAiLogs = async () => {
    try {
      const response = await fetch('http://125.132.216.190:12450/api/logs/ai'); // AI 로그 API 호출
      const data = await response.json();
      setAiLogs(data.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))); // 최신순 정렬
    } catch (error) {
      console.error('Error fetching AI logs:', error);
    }
  };

  useEffect(() => {
    fetchAiLogs();  // 컴포넌트 마운트 시 AI 로그를 불러옴
  }, []);

  return (
    <div>
      <h4>AI 로그</h4>
      <CTable bordered hover responsive className="text-center"> {/* 테이블 스타일 추가 */}
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>이벤트 유형</CTableHeaderCell>
            <CTableHeaderCell>사용자 이메일</CTableHeaderCell>
            <CTableHeaderCell>IP 주소</CTableHeaderCell>
            <CTableHeaderCell>이벤트 시간</CTableHeaderCell>
            <CTableHeaderCell>질문</CTableHeaderCell>
            <CTableHeaderCell>응답</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {getPaginatedLogs(aiLogs, aiPage, itemsPerPage).map((log, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{log.eventType}</CTableDataCell>
              <CTableDataCell>{log.userEmail}</CTableDataCell>
              <CTableDataCell>{log.ipAddress}</CTableDataCell>
              <CTableDataCell>{new Date(log.eventTime).toLocaleString()}</CTableDataCell>
              {/* 긴 텍스트는 줄바꿈 처리 */}
              <CTableDataCell style={{ whiteSpace: 'pre-wrap' }}>{log.question || '-'}</CTableDataCell>
              <CTableDataCell style={{ whiteSpace: 'pre-wrap' }}>{log.answer || '-'}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      <CPagination className="justify-content-center">
        <CPaginationItem
          disabled={aiPage === 1}
          onClick={() => setAiPage(aiPage - 1)}
        >
          이전
        </CPaginationItem>
        {[...Array(totalPages(aiLogs))].map((_, pageNum) => (
          <CPaginationItem
            key={pageNum}
            active={aiPage === pageNum + 1}
            onClick={() => setAiPage(pageNum + 1)}
          >
            {pageNum + 1}
          </CPaginationItem>
        ))}
        <CPaginationItem
          disabled={aiPage === totalPages(aiLogs)}
          onClick={() => setAiPage(aiPage + 1)}
        >
          다음
        </CPaginationItem>
      </CPagination>
    </div>
  );
};

export default Dashboard;
