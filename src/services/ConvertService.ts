import axios from "axios";


const API_KEY = 'KowVpR9gEn3n3ga0ORmZEgVHS2Z3mMslTP3jj6v6AdTwtohxfPrSuglg77zXP17rEAHS4FwtwMdsB2dwZBz5A';
class ConvertService{

    async postCommand(tableName:string, strVals:string, op:number){
        // return axios.post('https://datamate-api.onrender.com/convert',{
        return axios.post('http://localhost:8080/convert',{
            tblName: tableName,
            vals: strVals,
            operation: op,
        })
        .then((res)=>{
            return res.data
        }).catch((err)=>{
            console.log(err);
        })
    }

    //Using SQLizer API (did not work) ---------------------------------------------------------------

    // async postFileEntity(filename:string, filetype:string){
    //     return axios.post('https://sqlizer.io/api/files', {
    //         "FileType": filetype,
    //         "FileName": filename,
    //         "TableName": filename.replace(/\.[^/.]+$/, ""),
    //         "DatabaseType": "mySQL",
    //         "FileHasHeaders": true
    //     },{
    //         headers:{
    //             'Authorization':`Bearer ${API_KEY}`
    //         }
    //     }).then((res)=>{
    //         return res.data;
    //     }).catch((err)=>{
    //         console.log(err);
    //     })
    // }

    // async uploadFile(file:File, dataID:string){
    //     return axios.post(`https://sqlizer.io/api/files/${dataID}/data`, {
    //         "file": file,
    //     }, {
    //         headers:{
    //         'Authorization':`Bearer ${API_KEY}`
    //     }
    // }).then((res)=>{
    //     return res.data;
    // }).catch((err)=>{
    //     console.log(err);
    // })
    // }

    // async putFileEntity(dataID:string){
    //     return axios.put(`https://sqlizer.io/api/files/${dataID}`,{
    //         "Status": "Uploaded",
    //     },{
    //         headers:{
    //             'Authorization':`Bearer ${API_KEY}`
    //         }
    //     }).then((res)=>{
    //         return res.data;
    //     }).catch((err)=>{
    //         console.log(err);
    //     })
    // }

    // async getConverion(dataID:string){
    //     return axios.get(`https://sqlizer.io/api/files/${dataID}`,{
    //         headers:{
    //             'Authorization':`Bearer ${API_KEY}`
    //         }
    //     }).then((res)=>{
    //         return res.data;
    //     }).catch((err)=>{
    //         console.log(err);
    //     })
    // }
    //-----------------------------------------------------------------------------------------
}
export default new ConvertService();