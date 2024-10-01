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

    

}
export default new FormService();