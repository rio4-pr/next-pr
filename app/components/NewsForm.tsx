"use client";

import { useEffect, useState } from "react";
import {
    successAlert,
    errorAlert,
} from "@/lib/swal";

export default function NewsForm() {
    const [categories, setCategories] =
        useState<any[]>([]);

    const [sources, setSources] =
        useState<any[]>([]);

    const [form, setForm] = useState({
        category_id: "",

        source_id: "",

        news_title: "",

        news_summary: "",

        news_url: "",

        news_date: "",

        sentiment: "NEUTRAL",

        is_highlighted: false,
    });

    useEffect(() => {
        fetchCategories();
        fetchSources();
    }, []);

    const fetchCategories = async () => {
        const res = await fetch(
            "/api/categories"
        );

        const data = await res.json();

        setCategories(data);
    };

    const fetchSources = async () => {
        const res = await fetch(
            "/api/sources"
        );

        const data = await res.json();

        setSources(data);
    };

    const submit = async () => {
        try {
            const res = await fetch(
                "/api/news",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        ...form,

                        category_id:
                            Number(
                                form.category_id
                            ),

                        source_id:
                            Number(
                                form.source_id
                            ),
                    }),
                }
            );

            if (!res.ok) {
                throw new Error();
            }

            await successAlert(
                "บันทึกข้อมูลสำเร็จ"
            );

            setForm({
                category_id: "",
                source_id: "",
                news_title: "",
                news_summary: "",
                news_url: "",
                news_date: "",
                sentiment: "NEUTRAL",
                is_highlighted: false,
            });
        } catch {
            errorAlert(
                "ไม่สามารถบันทึกข้อมูลได้"
            );
        }
    };

    return (
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">

            <h2 className="mb-6 text-2xl font-bold">
                เพิ่มข่าว
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* หมวดข่าว */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        หมวดข่าว
                    </label>

                    <select
                        className="w-full rounded-lg border p-2"
                        value={form.category_id}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                category_id:
                                    e.target.value,
                            })
                        }
                    >
                        <option value="">
                            เลือกหมวดข่าว
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={
                                        item.category_id
                                    }
                                    value={
                                        item.category_id
                                    }
                                >
                                    {
                                        item.category_name
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* แหล่งข่าว */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        แหล่งข่าว
                    </label>

                    <select
                        className="w-full rounded-lg border p-2"
                        value={form.source_id}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                source_id:
                                    e.target.value,
                            })
                        }
                    >
                        <option value="">
                            เลือกแหล่งข่าว
                        </option>

                        {sources.map(
                            (item) => (
                                <option
                                    key={
                                        item.source_id
                                    }
                                    value={
                                        item.source_id
                                    }
                                >
                                    {
                                        item.source_name
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* วันที่ข่าว */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        วันที่ข่าว
                    </label>

                    <input
                        type="date"
                        className="w-full rounded-lg border p-2"
                        value={form.news_date}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                news_date:
                                    e.target.value,
                            })
                        }
                    />
                </div>

                {/* Sentiment */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        วิเคราะห์ความรู้สึก
                    </label>

                    <select
                        className="w-full rounded-lg border p-2"
                        value={form.sentiment}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                sentiment:
                                    e.target.value,
                            })
                        }
                    >
                        <option value="POSITIVE">
                            POSITIVE
                        </option>

                        <option value="NEGATIVE">
                            NEGATIVE
                        </option>

                        <option value="NEUTRAL">
                            NEUTRAL
                        </option>
                    </select>
                </div>
            </div>

            {/* หัวข้อข่าว */}
            <div className="mt-4">
                <label className="mb-1 block text-sm font-medium">
                    หัวข้อข่าว
                </label>

                <input
                    className="w-full rounded-lg border p-2"
                    placeholder="กรอกหัวข้อข่าว"
                    value={form.news_title}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            news_title:
                                e.target.value,
                        })
                    }
                />
            </div>

            {/* สรุปข่าว */}
            <div className="mt-4">
                <label className="mb-1 block text-sm font-medium">
                    สรุปข่าว
                </label>

                <textarea
                    rows={6}
                    className="w-full rounded-lg border p-2"
                    placeholder="กรอกสรุปข่าว"
                    value={form.news_summary}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            news_summary:
                                e.target.value,
                        })
                    }
                />
            </div>

            {/* URL */}
            <div className="mt-4">
                <label className="mb-1 block text-sm font-medium">
                    ลิงก์ข่าว
                </label>

                <input
                    className="w-full rounded-lg border p-2"
                    placeholder="https://..."
                    value={form.news_url}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            news_url:
                                e.target.value,
                        })
                    }
                />
            </div>

            {/* Highlight */}
            <div className="mt-4 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={
                        form.is_highlighted
                    }
                    onChange={(e) =>
                        setForm({
                            ...form,
                            is_highlighted:
                                e.target.checked,
                        })
                    }
                />

                <label>
                    ข่าวสำคัญ
                </label>
            </div>

            <div className="mt-6">
                <button
                    onClick={submit}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                    บันทึกข้อมูล
                </button>
            </div>
        </div>
    );
}
