import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const CLIENT_URL = process.env.REACT_APP_CLIENT_URL || "http://localhost:3000";
// const API_URL = 'https://datamate-api.onrender.com'

interface ReportRequest {
    headers: string[];
    dbName: string;
    tblName: string;
    addPrompt: string;
}

interface ReportEntity {
    reportId?: number;
    reportName: string;
    reportCode: string;
    userId: number;
}

interface ColumnDefinition {
    name: string;
    header: string;
    defaultFlex: number;
}

class ReportService {
    async postReports(report: ReportEntity) {
        return axios.post(`${API_URL}/postReports`, report)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            }).catch((err) => {
                console.log(err);
                throw err;
            });
    }
    // async postReports(rprtName:string, rprtCode:string, userid:string){
    //     return axios.post(`${API_URL}/postReports`,{
    //         "reportName": rprtName,
    //         "reportCode": rprtCode,
    //         "userId": userid,
    //     }).then((res)=>{
    //         if (res.data) {
    //             return res.data;
    //         }
    //     }).catch((err)=>{
    //         console.log(err);
    //     });
    // }

    // async getReportByNameAndUser(name: string,userid: number){
    //     return axios.get(`${API_URL}/getUserDBs?dbName=${name}&userId=${userid}`)
    //     .then((res)=>{
    //         if (res.data) {
    //             return res.data;
    //         }
    //     }).catch((err)=>{
    //         console.log(err);
    //     })
    // }

    async getReportsByUser(userid: string){
        return axios.get(`${API_URL}/getUserReports/${userid}`)
        .then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        })
    }
    async processReportHeaders(requestData: ReportRequest) {
        return axios.post(`${API_URL}/api/reports`, requestData)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            }).catch((err) => {
                console.log(err);
                throw err;
            });
    }

    async getReportById(reportId: number): Promise<ReportEntity | null> {
        try {
            const response = await axios.get(`${API_URL}/getReports?rprtId=${reportId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching report entity:", error);
            return null;
        }
    }

    async deleteReport(reportId: number): Promise<boolean> {
        try {
            const response = await axios.delete(`${API_URL}/deleteReport?rprtId=${reportId}`);
            console.log("Delete Report Response:", response.data);
            alert("Report successfully deleted!");
            window.location.href = `${CLIENT_URL}/reports`;
            return true;
        } catch (error) {
            console.error("Error deleting report:", error);
            return false;
        }
    }

    async renameReport(reportId: number, newName: string): Promise<ReportEntity | null> {
        try {
            const response = await axios.put(`${API_URL}/rename/${reportId}`, {
                newReportName: newName,
            });
            console.log("Rename Report Response:", response.data);
            alert("Report successfully renamed!");
            window.location.href = `${CLIENT_URL}/reports`;
            return response.data;
        } catch (error) {
            console.error("Error renaming report:", error);
            return null;
        }
    }

    async executeReportQuery(reportId: number): Promise<{
        columns: ColumnDefinition[];
        data: Array<{ [key: string]: any }>;
    } | null> {
        try {
            const response = await axios.get(`${API_URL}/executeReportQueryById/${reportId}`);
            const reportData: Array<{ [key: string]: any }> = response.data;
            
            if (reportData.length > 0) {
                const firstRow = reportData[0];
                
                // Define columns
                const columns = Object.keys(firstRow).map((key) => ({
                    name: key,
                    header: key.charAt(0).toUpperCase() + key.slice(1),
                    defaultFlex: 1,
                }));

                // Process aggregates
                const aggregateRow: { [key: string]: number | string } = {};
                let hasAggregates = false;

                Object.keys(firstRow).forEach((key) => {
                    if (key.toLowerCase().includes("total") || 
                        key.toLowerCase().includes("amount") || 
                        key.toLowerCase().includes("salary")) {
                        hasAggregates = true;
                        aggregateRow[key] = reportData.reduce((sum: number, row: { [key: string]: any }) => {
                            return sum + (parseFloat(row[key]) || 0);
                        }, 0);
                    }
                });

                Object.keys(firstRow).forEach((key) => {
                    if (!aggregateRow[key]) {
                        aggregateRow[key] = key === 'titleColumn' ? "Total" : '';
                    }
                });

                if (hasAggregates) {
                    aggregateRow[Object.keys(firstRow)[0]] = "Total";
                    reportData.push(aggregateRow);
                }

                return {
                    columns,
                    data: reportData,
                };
            }
            return null;
        } catch (error) {
            console.error("Error executing report query:", error);
            return null;
        }
    }
}
export default new ReportService();