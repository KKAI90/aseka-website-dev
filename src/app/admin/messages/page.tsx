"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Msg = { id:string; type:string; name:string; company:string|null; email:string; phone:string|null; service:string|null; message:string|null; status:string; created_at:string };

const SVC: Record<string,{ja:string;vn:string}> = {
  hr:     {ja:"人材紹介",  vn:"Nhân sự"},
  nenkin: {ja:"年金",      vn:"Nenkin"},
  visa:   {ja:"ビザ",      vn:"Visa"},
  zairyu: {ja:"在留手続き",vn:"Lưu trú"},
  other:  {ja:"その他",    vn:"Khác"},
};
const ST: Record<string,{ja:string;vn:string;tc:string;tb:string}> = {
  new:       {ja:"新規",    vn:"Mới",         tc:"#0C447C",tb:"#E6F1FB"},
  contacted: {ja:"連絡済み",vn:"Đã liên hệ",  tc:"#27500A",tb:"#EAF3DE"},
  closed:    {ja:"完了",    vn:"Hoàn thành",  tc:"#444441",tb:"#F1EFE8"},
};

export default function MessagesPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Msg|null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async()=>{
    const res=await fetch("/api/admin/messages");
    if(res.status===401){router.push("/admin/login");return;}
    const d=await res.json();
    setMsgs(d.data||[]);
    setLoading(false);
  },[router]);
  useEffect(()=>{load();},[load]);

  const updateStatus=async(id:string,status:string)=>{
    await fetch("/api/admin/messages",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    setMsgs(p=>p.map(m=>m.id===id?{...m,status}:m));
    setSelected(p=>p?.id===id?{...p,status}:p);
  };

  const filtered=msgs.filter(m=>{
    const ok1=filter==="all"||m.status===filter;
    const ok2=search===""||m.name.toLowerCase().includes(search.toLowerCase())||m.email.includes(search)||(m.company||"").toLowerCase().includes(search.toLowerCase());
    return ok1&&ok2;
  });
  const counts={all:msgs.length,new:msgs.filter(m=>m.status==="new").length,contacted:msgs.filter(m=>m.status==="contacted").length,closed:msgs.filter(m=>m.status==="closed").length};
  const fmt=(iso:string)=>{const d=new Date(iso);return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;};
  const B={border:"0.5px solid rgba(11,31,58,0.1)"};

  return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:"#0B1F3A"}}>メッセージ管理 / Quản lý Tin nhắn</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>Webフォームからの問い合わせ · Form liên hệ từ website</div>
        </div>
        <input type="text" placeholder="名前・会社名で検索..." value={search} onChange={e=>setSearch(e.target.value)} style={{padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",width:"220px"}}/>
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"14px"}}>
          {Object.entries(ST).map(([k,v])=>(
            <div key={k} onClick={()=>setFilter(filter===k?"all":k)} style={{background:filter===k?"#0B1F3A":"#fff",...B,borderRadius:"10px",padding:"14px 16px",cursor:"pointer"}}>
              <div style={{fontSize:"26px",fontWeight:700,color:filter===k?"#fff":v.tc}}>{counts[k as keyof typeof counts]}</div>
              <div style={{fontSize:"12px",fontWeight:600,color:filter===k?"rgba(255,255,255,0.9)":v.tc}}>{v.ja}</div>
              <div style={{fontSize:"10px",color:filter===k?"rgba(255,255,255,0.55)":"#6B6B6B"}}>{v.vn}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 360px":"1fr",gap:"12px"}}>
          <div style={{background:"#fff",...B,borderRadius:"10px",overflow:"hidden"}}>
            {loading?(
              <div style={{padding:"40px",textAlign:"center",color:"#6B6B6B",fontSize:"13px"}}>読み込み中... / Đang tải...</div>
            ):filtered.length===0?(
              <div style={{padding:"40px",textAlign:"center",color:"#6B6B6B",fontSize:"13px"}}>データなし / Không có dữ liệu</div>
            ):(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
                <thead><tr style={{background:"#F6F7F9"}}>
                  {["日時 / Ngày","送信者 / Người gửi","サービス","内容 / Nội dung","ステータス"].map(h=>(
                    <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.map(m=>{
                    const st=ST[m.status]||ST.new;
                    const svc=SVC[m.service||""];
                    return(
                      <tr key={m.id} onClick={()=>setSelected(selected?.id===m.id?null:m)} style={{borderBottom:"0.5px solid rgba(11,31,58,0.05)",cursor:"pointer",background:selected?.id===m.id?"#E6F1FB":"transparent"}}>
                        <td style={{padding:"10px 12px",color:"#6B6B6B",fontSize:"10px",whiteSpace:"nowrap"}}>{fmt(m.created_at)}</td>
                        <td style={{padding:"10px 12px"}}>
                          <div style={{fontWeight:600,color:"#0B1F3A"}}>{m.name}</div>
                          {m.company&&<div style={{fontSize:"10px",color:"#6B6B6B"}}>{m.company}</div>}
                        </td>
                        <td style={{padding:"10px 12px"}}>
                          {svc&&<div style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px",display:"inline-block"}}>{svc.ja}<br/><span style={{fontWeight:400,fontSize:"9px"}}>{svc.vn}</span></div>}
                        </td>
                        <td style={{padding:"10px 12px",maxWidth:"180px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"11px",color:"#6B6B6B"}}>{m.message||"—"}</td>
                        <td style={{padding:"10px 12px"}}>
                          <div style={{background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px",display:"inline-block"}}>
                            {st.ja}<br/><span style={{fontWeight:400,fontSize:"9px"}}>{st.vn}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {selected&&(
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",height:"fit-content",position:"sticky",top:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                <div>
                  <div style={{fontSize:"15px",fontWeight:700,color:"#0B1F3A"}}>{selected.name}</div>
                  {selected.company&&<div style={{fontSize:"11px",color:"#6B6B6B"}}>{selected.company}</div>}
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",fontSize:"18px"}}>×</button>
              </div>
              {[
                {l:"Email",v:selected.email},
                {l:"電話 / SĐT",v:selected.phone||"—"},
                {l:"種別",v:selected.type==="business"?"企業 / Doanh nghiệp":"個人 / Cá nhân"},
                {l:"サービス",v:SVC[selected.service||""]?`${SVC[selected.service||""].ja} · ${SVC[selected.service||""].vn}`:"—"},
                {l:"受信日時",v:fmt(selected.created_at)},
              ].map(r=>(
                <div key={r.l} style={{display:"flex",gap:"8px",marginBottom:"8px",fontSize:"12px"}}>
                  <span style={{color:"#6B6B6B",width:"90px",flexShrink:0}}>{r.l}</span>
                  <span style={{color:"#0B1F3A",fontWeight:500}}>{r.v}</span>
                </div>
              ))}
              {selected.message&&(
                <div style={{margin:"10px 0"}}>
                  <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"5px"}}>メッセージ / Nội dung</div>
                  <div style={{background:"#F6F7F9",borderRadius:"7px",padding:"10px",fontSize:"12px",color:"#0B1F3A",lineHeight:1.65}}>{selected.message}</div>
                </div>
              )}
              <div style={{borderTop:"0.5px solid rgba(11,31,58,0.08)",paddingTop:"12px",marginTop:"4px"}}>
                <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"7px"}}>ステータス変更 / Đổi trạng thái</div>
                <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                  {Object.entries(ST).map(([k,v])=>(
                    <button key={k} onClick={()=>updateStatus(selected.id,k)} style={{padding:"5px 9px",borderRadius:"5px",fontSize:"10px",fontWeight:600,cursor:"pointer",background:selected.status===k?v.tc:v.tb,color:selected.status===k?"#fff":v.tc,border:`1px solid ${v.tc}`}}>
                      {v.ja} · {v.vn}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:"7px",marginTop:"12px"}}>
                <a href={`mailto:${selected.email}`} style={{flex:1,padding:"8px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:"#0B1F3A",color:"#fff",textDecoration:"none"}}>メール送信 · Email</a>
                {selected.phone&&<a href={`tel:${selected.phone}`} style={{flex:1,padding:"8px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:"#EAF3DE",color:"#27500A",textDecoration:"none",border:"0.5px solid #27500A"}}>電話 · Gọi</a>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}