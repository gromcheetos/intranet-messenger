
interface ToggleSwitchProps {
    value: string;           // 'Y' or 'N'
    onChange: (val: string) => void;
}

export default function ToggleSwitch({ value, onChange }: ToggleSwitchProps) {
    const isActive = value === 'Y';

    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: 44, height: 24 }}>
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onChange(isActive ? 'N' : 'Y')}
                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                />
                {/* Track */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: 12,
                    background: isActive ? '#1D9E75' : '#B4B2A9',
                    transition: 'background 0.2s'
                }} />
                {/* Thumb */}
                <div style={{
                    position: 'absolute', top: 3,
                    left: isActive ? 23 : 3,
                    width: 18, height: 18,
                    background: '#fff', borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
            </div>
            <span style={{
                fontSize: 14, fontWeight: 500,
                color: isActive ? '#0F6E56' : '#888780'
            }}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        </label>
    );
}