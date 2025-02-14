
function toSerializable(obj: any, seen = new WeakSet()): any {
    if (obj && typeof obj.toJSON === "function") return obj.toJSON(); // Если есть toJSON(), используем его
    if (seen.has(obj)) return "[Circular]"; // Если объект уже обработан, предотвращаем зацикливание
    if (Array.isArray(obj)) return obj.map((item) => toSerializable(item, seen));

    if (obj && typeof obj === "object") {
        seen.add(obj); // Помечаем объект как обработанный
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, toSerializable(value, seen)])
        );
    }
    return obj;
}

export { toSerializable }