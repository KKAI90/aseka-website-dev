"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Job = { id:string;company:string;location:string;position_ja:string;position_vn:string;industry:string;count:number;salary:string;jlpt_min:string;status:string };
const ST: Record<string,{ja:string;vn:string;tc:string;tb:string}> = {
  urgent:{ja:"緊急募集",vn:"Khẩn cấp",tc:"#A32D2D",tb:"#FCEBEB"},
  open:  {ja:"募集中",  vn:"Đang tuyển",tc:"#0C447C",tb:"#E6F1FB"},
  full:  {ja:"充足",    vn:"Đủ người",  tc:"#27500A",tb:"#EAF3DE"},
  paused:{ja:"停止",    vn:"Tạm dừng",  tc:"#444441",tb:"#F1EFE8"},
};
const IND: Record<string,{tc:string;tb:string}> = {
  "飲食":{tc:"#0C447C",tb:"#E6F1FB"},"製造":{tc:"#27500A",tb:"#EAF3DE"},
  "農業":{tc:"#633806",tb:"#FAEEDA"},"ホテル":{tc:"#534AB7",tb:"#EEEDFE"},
};
const EMPTY = {company:"",location:"",position_ja:"",position_vn:"",industry:"飲食",count:"1",salary:"",jlpt_min:"N4",status:"open"};

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const B = {border:"0.5px solid rgba(11,31,58,0.1)"};

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/jobs");
    if (res.status===401){router.push("/admin/login");return;}
    const d = await res.json();
    setJobs(d.data||[]);
    setLoading(false);
  },[router]);

  useEffect(()=>{load();},[load]);

  const filtered = filter==="all" ? jobs : jobs.filter(j=>j.status===filter);
  const counts = {all:jobs.length,urgent:jobs.filter(j=>j.status==="urgent").length,open:jobs.filter(j=>j.status==="open").length,full:jobs.filter(j=>j.status==="full").length,paused:jobs.filter(j=>j.status==="paused").length};

  const addJob = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/admin/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,count:Number(form.count)})});
    if(res.ok){await load();setShowForm(false);setForm(EMPTY);}
    setSaving(false);
  };

  const updateStatus = async (id:string,status:string) => {
    await fetch("/api/admin/jobs",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    setJobs(p=>p.map(j=>j.id===id?{...j,status}:j));
  };

  const deleteJob = async (id:string) => {
    if(!confirm("削除しますか？/ Xóa?")) return;
    await fetch(`/api/admin/jobs?id=${id}`,{method:"DELETE"});
    setJobs(p=>p.filter(j=>j.id!==id));
  };

  const tabs=[{key:"all",label:`全件(${counts.all})`},{key:"urgent",label:`緊急(${counts.urgent})`},{key:"open",label:`募集中(${counts.open})`},{key:"full",label:`充足(${counts.full})`},{key:"paused",label:`停止(${counts.paused})`}];

  return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:"#0B1F3A"}}>求人管理 / Quản lý Công việc</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>Supabase DB · リアルタイム同期</div>
        </div>
        <button onClick={()=>setShowForm(true)} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"#0B1F3A",color:"#fff",border:"none",cursor:"pointer"}}>+ 求人追加</button>
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"flex",gap:0,borderBottom:"0.5px solid rgba(11,31,58,0.1)",marginBottom:"14px"}}>
          {tabs.map(t=><button key={t.key} onClick={()=>setFilter(t.key)} style={{padding:"8px 14px",fontSize:"11px",fontWeight:filter===t.key?700:400,color:filter===t.key?"#0B1F3A":"#6B6B6B",border:"none",background:"transparent",borderBottom:`2px solid ${filter===t.key?"#0B1F3A":"transparent"}`,cursor:"pointer",marginBottom:"-0.5px",whiteSpace:"nowrap"}}>{t.label}</button>)}
        </div>

        {showForm&&(
          <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"14px"}}>
            <div style={{fontSize:"13px",fontWeight:700,color:"#0B1F3A",marginBottom:"12px"}}>新規求人追加 / Thêm mới</div>
            <form onSubmit={addJob}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"10px"}}>
                {[{f:"company",l:"企業名 *",p:"山本フーズ"},{f:"location",l:"勤務地",p:"東京都"},{f:"position_ja",l:"職種（日本語）*",p:"調理師"},{f:"position_vn",l:"Vị trí (Việt)",p:"Nhân viên bếp"},{f:"salary",l:"給与",p:"¥200,000"},{f:"count",l:"人数",p:"3"}].map(x=>(
                  <div key={x.f}>
                    <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>{x.l}</label>
                    <input required={x.f==="company"||x.f==="position_ja"} type={x.f==="count"?"number":"text"} placeholder={x.p} value={(form as Record<string,string>)[x.f]} onChange={e=>setForm({...form,[x.f]:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                  </div>
                ))}
                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>業種</label>
                  <select value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {["飲食","製造","農業","ホテル","その他"].map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>日本語要件</label>
                  <select value={form.jlpt_min} onChange={e=>setForm({...form,jlpt_min:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {["N1","N2","N3","N4","N5","なし"].map(j=><option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>ステータス</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {Object.entries(ST).map(([k,v])=><option key={k} value={k}>{v.ja}・{v.vn}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                <button type="submit" disabled={saving} style={{padding:"7px 16px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:saving?"#888":"#0B1F3A",color:"#fff",border:"none",cursor:"pointer"}}>{saving?"保存中...":"保存 / Lưu"}</button>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:"7px 16px",borderRadius:"6px",fontSize:"12px",background:"transparent",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.2)",cursor:"pointer"}}>キャンセル</button>
              </div>
            </form>
          </div>
        )}

        <div style={{background:"#fff",...B,borderRadius:"10px",overflow:"hidden"}}>
          {loading?<div style={{padding:"40px",textAlign:"center",color:"#6B6B6B"}}>読み込み中...</div>:filtered.length===0?<div style={{padding:"40px",textAlign:"center",color:"#6B6B6B"}}>データなし / Chưa có dữ liệu</div>:(
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
              <thead><tr style={{background:"#F6F7F9"}}>
                {["企業","職種","業種","人数","給与","ステータス","操作"].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(j=>{
                  const st=ST[j.status]||ST.open; const ind=IND[j.industry]||IND["飲食"];
                  return(
                    <tr key={j.id} style={{borderBottom:"0.5px solid rgba(11,31,58,0.05)"}}>
                      <td style={{padding:"10px 12px"}}><div style={{fontWeight:600,color:"#0B1F3A"}}>{j.company}</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{j.location}</div></td>
                      <td style={{padding:"10px 12px"}}><div style={{color:"#0B1F3A"}}>{j.position_ja}</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{j.position_vn}</div></td>
                      <td style={{padding:"10px 12px"}}><span style={{background:ind.tb,color:ind.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{j.industry}</span></td>
                      <td style={{padding:"10px 12px",fontWeight:700,color:"#0B1F3A",textAlign:"center"}}>{j.count}名</td>
                      <td style={{padding:"10px 12px",color:"#27500A",fontWeight:600}}>{j.salary}</td>
                      <td style={{padding:"10px 12px"}}>
                        <select value={j.status} onChange={e=>updateStatus(j.id,e.target.value)} style={{padding:"4px 6px",borderRadius:"5px",fontSize:"10px",border:"0.5px solid rgba(11,31,58,0.2)",background:st.tb,color:st.tc,cursor:"pointer",outline:"none",fontWeight:700}}>
                          {Object.entries(ST).map(([k,v])=><option key={k} value={k}>{v.ja}</option>)}
                        </select>
                      </td>
                      <td style={{padding:"10px 12px"}}>
                        <button onClick={()=>deleteJob(j.id)} style={{padding:"4px 8px",borderRadius:"5px",fontSize:"10px",fontWeight:600,border:"0.5px solid #FCEBEB",background:"#FCEBEB",cursor:"pointer",color:"#A32D2D"}}>削除</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}