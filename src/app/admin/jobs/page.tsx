"use client";
import { useState } from "react";

type Job = { id:number; company:string; location:string; position:string; positionJa:string; industry:string; count:number; salary:string; status:string; candidates:number };

const INIT: Job[] = [
  { id:1, company:"山本フーズ株式会社",   location:"東京都 新宿区",   position:"Nhân viên bếp",     positionJa:"調理師・キッチンスタッフ", industry:"飲食",  count:3, salary:"¥200,000", status:"urgent",   candidates:2 },
  { id:2, company:"東京工場株式会社",     location:"埼玉県 川口市",   position:"Công nhân dây chuyền",positionJa:"製造ラインスタッフ",    industry:"製造",  count:5, salary:"¥185,000", status:"urgent",   candidates:4 },
  { id:3, company:"グランドホテル大阪",   location:"大阪府 難波",     position:"Phục vụ phòng",     positionJa:"客室清掃スタッフ",       industry:"ホテル",count:2, salary:"¥175,000", status:"open",     candidates:1 },
  { id:4, company:"みどり農業組合",       location:"北海道 札幌市",   position:"Nhân viên nông trại",positionJa:"農場作業員",            industry:"農業",  count:4, salary:"¥165,000", status:"open",     candidates:0 },
  { id:5, company:"さくらレストラン",     location:"神奈川県 横浜市", position:"Phục vụ bàn",       positionJa:"ホールスタッフ",         industry:"飲食",  count:2, salary:"¥170,000", status:"paused",   candidates:1 },
  { id:6, company:"横浜物流センター",     location:"神奈川県 横浜市", position:"Nhân viên kho",     positionJa:"倉庫内作業員",           industry:"製造",  count:3, salary:"¥180,000", status:"full",     candidates:3 },
];

const ST: Record<string,{ja:string;vn:string;tc:string;tb:string}> = {
  urgent:{ja:"緊急募集",vn:"⚡ Khẩn cấp",  tc:"#A32D2D",tb:"#FCEBEB"},
  open:  {ja:"募集中",  vn:"Đang tuyển",   tc:"#0C447C", tb:"#E6F1FB"},
  full:  {ja:"充足",    vn:"Đã đủ người",  tc:"#27500A", tb:"#EAF3DE"},
  paused:{ja:"一時停止", vn:"Tạm dừng",    tc:"#444441", tb:"#F1EFE8"},
};
const IND: Record<string,{tc:string;tb:string}> = {
  "飲食":  {tc:"#0C447C",tb:"#E6F1FB"},
  "製造":  {tc:"#27500A",tb:"#EAF3DE"},
  "農業":  {tc:"#633806",tb:"#FAEEDA"},
  "ホテル":{tc:"#534AB7",tb:"#EEEDFE"},
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(INIT);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company:"", location:"", position:"", positionJa:"", industry:"飲食", count:"1", salary:"", status:"open" });

  const filtered = filter==="all" ? jobs : jobs.filter(j=>j.status===filter);
  const counts = { all:jobs.length, urgent:jobs.filter(j=>j.status==="urgent").length, open:jobs.filter(j=>j.status==="open").length, full:jobs.filter(j=>j.status==="full").length, paused:jobs.filter(j=>j.status==="paused").length };

  const addJob = (e: React.FormEvent) => {
    e.preventDefault();
    setJobs([{ id:Date.now(), ...form, count:Number(form.count), candidates:0 }, ...jobs]);
    setShowForm(false);
    setForm({ company:"", location:"", position:"", positionJa:"", industry:"飲食", count:"1", salary:"", status:"open" });
  };

  const B = { border:"0.5px solid rgba(11,31,58,0.1)" };
  const tabs = [
    {key:"all",   label:`全件 / Tất cả (${counts.all})`},
    {key:"urgent",label:`⚡ 緊急 / Khẩn cấp (${counts.urgent})`},
    {key:"open",  label:`募集中 / Đang tuyển (${counts.open})`},
    {key:"full",  label:`充足 / Đủ người (${counts.full})`},
    {key:"paused",label:`停止 / Tạm dừng (${counts.paused})`},
  ];

  return (
    <div>
      <div style={{ background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:"14px",fontWeight:700,color:"#0B1F3A" }}>求人管理 / Quản lý Công việc</div>
          <div style={{ fontSize:"10px",color:"#6B6B6B" }}>企業からの求人一覧 · Danh sách tuyển dụng</div>
        </div>
        <button onClick={()=>setShowForm(true)} style={{ padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"#0B1F3A",color:"#fff",border:"none",cursor:"pointer" }}>
          + 求人追加 / Thêm công việc
        </button>
      </div>
      <div style={{ padding:"16px 20px" }}>
        <div style={{ display:"flex",gap:0,borderBottom:"0.5px solid rgba(11,31,58,0.1)",marginBottom:"14px" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={()=>setFilter(t.key)} style={{ padding:"8px 14px",fontSize:"11px",fontWeight:filter===t.key?700:400,color:filter===t.key?"#0B1F3A":"#6B6B6B",border:"none",background:"transparent",borderBottom:`2px solid ${filter===t.key?"#0B1F3A":"transparent"}`,cursor:"pointer",marginBottom:"-0.5px",whiteSpace:"nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {showForm && (
          <div style={{ background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"14px" }}>
            <div style={{ fontSize:"13px",fontWeight:700,color:"#0B1F3A",marginBottom:"12px" }}>求人追加 / Thêm công việc mới</div>
            <form onSubmit={addJob}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"10px" }}>
                {[
                  {f:"company",   l:"企業名 / Công ty *",   p:"山本フーズ株式会社"},
                  {f:"location",  l:"勤務地 / Địa điểm",   p:"東京都 新宿区"},
                  {f:"positionJa",l:"求人職種（日本語）",   p:"調理師・キッチンスタッフ"},
                  {f:"position",  l:"Vị trí (tiếng Việt)", p:"Nhân viên bếp"},
                  {f:"salary",    l:"給与 / Lương",         p:"¥200,000"},
                  {f:"count",     l:"募集人数 / Số người",  p:"3"},
                ].map(x=>(
                  <div key={x.f}>
                    <label style={{ display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600 }}>{x.l}</label>
                    <input required={x.f==="company"} type={x.f==="count"?"number":"text"} placeholder={x.p} value={(form as Record<string,string>)[x.f]} onChange={e=>setForm({...form,[x.f]:e.target.value})} style={{ width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none" }}/>
                  </div>
                ))}
                <div>
                  <label style={{ display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600 }}>業種 / Ngành</label>
                  <select value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} style={{ width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none" }}>
                    {["飲食","製造","農業","ホテル","その他"].map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600 }}>ステータス / Trạng thái</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{ width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none" }}>
                    {Object.entries(ST).map(([k,v])=><option key={k} value={k}>{v.ja} · {v.vn}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"flex",gap:"8px" }}>
                <button type="submit" style={{ padding:"7px 16px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"#0B1F3A",color:"#fff",border:"none",cursor:"pointer" }}>保存 / Lưu</button>
                <button type="button" onClick={()=>setShowForm(false)} style={{ padding:"7px 16px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.2)",cursor:"pointer" }}>キャンセル / Hủy</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ background:"#fff",...B,borderRadius:"10px",overflow:"hidden" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:"12px" }}>
            <thead><tr style={{ background:"#F6F7F9" }}>
              {["企業 / Công ty","職種 / Vị trí","業種","人数","給与 / Lương","ステータス","候補者","操作"].map(h=>(
                <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(j => {
                const st=ST[j.status]; const ind=IND[j.industry]||IND["飲食"];
                return (
                  <tr key={j.id} style={{ borderBottom:"0.5px solid rgba(11,31,58,0.05)" }}>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ fontWeight:600,color:"#0B1F3A",fontSize:"12px" }}>{j.company}</div>
                      <div style={{ fontSize:"10px",color:"#6B6B6B" }}>{j.location}</div>
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ color:"#0B1F3A",fontSize:"12px" }}>{j.positionJa}</div>
                      <div style={{ fontSize:"10px",color:"#6B6B6B" }}>{j.position}</div>
                    </td>
                    <td style={{ padding:"10px 12px" }}><span style={{ background:ind.tb,color:ind.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px" }}>{j.industry}</span></td>
                    <td style={{ padding:"10px 12px",fontWeight:700,color:"#0B1F3A",textAlign:"center" }}>{j.count}名</td>
                    <td style={{ padding:"10px 12px",color:"#27500A",fontWeight:600 }}>{j.salary}</td>
                    <td style={{ padding:"10px 12px" }}><span style={{ background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px" }}>{st.ja}<br/><span style={{fontWeight:400}}>{st.vn}</span></span></td>
                    <td style={{ padding:"10px 12px",fontSize:"11px",color:j.candidates>0?"#185FA5":"#6B6B6B" }}>{j.candidates}名</td>
                    <td style={{ padding:"10px 12px" }}>
                      <select onChange={e=>setJobs(jobs.map(x=>x.id===j.id?{...x,status:e.target.value}:x))} value={j.status} style={{ padding:"4px 6px",borderRadius:"5px",fontSize:"10px",border:"0.5px solid rgba(11,31,58,0.2)",background:"transparent",cursor:"pointer",outline:"none" }}>
                        {Object.entries(ST).map(([k,v])=><option key={k} value={k}>{v.ja}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}