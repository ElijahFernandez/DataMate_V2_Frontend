import axios from "axios";

//FORM SERVICE NEEDS REWORK


// const API_URL = 'https://datamate-api.onrender.com'

const API_URL = "http://localhost:8080";
class FormService{
    async postForm(rprtName:string, rprtCode:string, userid:string){
        return axios.post(`${API_URL}/postForms`,{
            "reportName": rprtName,
            "reportCode": rprtCode,
            "userId": userid,
        }).then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        });
    }

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

    async getFormsByUser(userid: string){
        return axios.get(`${API_URL}/getUserForms/${userid}`)
        .then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        })
    }

    async getAllIds(idkeyColumn: string, tableName: string){
        return axios.get(`${API_URL}/getAllIds?idKeyColumn=${idkeyColumn}&tableName=${tableName}`)
        .then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        })
    }

    async getRowDataById(tableName: string, idKeyColumn: string, idValue: string) {
        try {
            const response = await axios.post(`${API_URL}/getRowData`, {
                tableName: tableName,
                idColumn: idKeyColumn,
                idValue: idValue
            });
    
            if (response.data) {
                return response.data;
            } else {
                return null; // Handle the case when no data is found
            }
        } catch (error) {
            console.error('Error fetching row data:', error);
            throw error; // Re-throw or handle the error based on your needs
        }
    }
    
}
export default new FormService();