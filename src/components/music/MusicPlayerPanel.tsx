import React, { useRef } from 'react';
import { useDrive } from '../../context/DriveContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Music, 
  Disc, 
  ListMusic, 
  Shuffle, 
  Repeat,
  Radio
} from 'lucide-react';

export const MusicPlayerPanel: React.FC = () => {
  const { 
    playlist, 
    currentSongIndex, 
    isPlaying, 
    volume, 
    isMuted, 
    currentTime, 
    duration,
    addLocalSongs,
    removeSong,
    playSong,
    togglePlayPause,
    nextSong,
    prevSong,
    seekTo,
    setVolumeLevel,
    toggleMute
  } = useDrive();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentSong = playlist[currentSongIndex] || null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addLocalSongs(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full h-full glass-panel rounded-2xl border border-cyan-500/30 p-6 flex flex-col gap-6 overflow-hidden shadow-2xl bg-[#080C16]/90 relative z-10">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="audio/*" 
        multiple 
        className="hidden" 
      />

      {/* Header with Title and Add Songs Button */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Music className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide flex items-center gap-2">
              Cockpit Music & Media
              {isPlaying && (
                <span className="flex items-center gap-0.5 ml-2">
                  <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-2 bg-cyan-500 rounded-full animate-bounce" />
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono">Stream built-in vibes or play songs from your device</p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Songs from Device</span>
        </button>
      </div>

      {/* Main Grid: Left Now Playing Stage & Right Interactive Playlist */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* Left 7 Columns: Hero Now Playing Card */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
          {/* Glowing Vinyl Album Visualizer */}
          <div className="flex-1 flex flex-col items-center justify-center relative my-2">
            <div className={`relative w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-slate-700 bg-slate-950 flex items-center justify-center shadow-2xl transition-all duration-700 ${
              isPlaying ? 'scale-105 shadow-[0_0_35px_rgba(0,240,255,0.4)] border-cyan-400/80' : ''
            }`}>
              {/* Spinning Disc Effect */}
              <div className={`w-full h-full rounded-full border-8 border-slate-900/80 flex items-center justify-center ${
                isPlaying ? 'animate-spin [animation-duration:8s]' : ''
              }`}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center border-4 border-slate-950 shadow-md">
                  <Disc className="w-8 h-8 text-black" />
                </div>
              </div>
            </div>

            {/* Song Details */}
            <div className="text-center mt-6 max-w-full px-4">
              <h3 className="text-lg font-bold text-cyan-200 truncate">
                {currentSong ? currentSong.title : 'No track selected'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1 flex items-center justify-center gap-2">
                <span>{currentSong ? currentSong.artist : 'Select a song below'}</span>
                {currentSong?.isLocal && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-sans">
                    Device File
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Player Scrub Bar */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
          </div>

          {/* Transport Controls Bar */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/80">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className="text-slate-400 hover:text-cyan-300 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(Number(e.target.value))}
                className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevSong}
                className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-black flex items-center justify-center font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black ml-1" />}
              </button>

              <button
                onClick={nextSong}
                className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Shuffle & Loop Stubs */}
            <div className="flex items-center gap-2 text-slate-500">
              <Shuffle className="w-4 h-4 hover:text-slate-300 cursor-pointer" />
              <Repeat className="w-4 h-4 hover:text-slate-300 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Playlist Queue & Management */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-cyan-400" />
              <span>Playlist ({playlist.length})</span>
            </h3>
            <span className="text-[10px] text-cyan-400/80 font-mono">
              Click any song to play
            </span>
          </div>

          {/* Song List Scroll View */}
          <div className="flex-1 overflow-y-auto mt-3 pr-1 flex flex-col gap-2 no-scrollbar">
            {playlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center py-8">
                <Radio className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                <p>No songs in playlist.</p>
                <p className="text-[10px] mt-1 text-slate-600">Click "Add Songs from Device" above to add your music.</p>
              </div>
            ) : (
              playlist.map((song, idx) => {
                const isSelected = idx === currentSongIndex;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(idx)}
                    className={`group px-3.5 py-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Left: Play Icon & Song Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-cyan-400 text-black font-bold' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'
                      }`}>
                        {isSelected && isPlaying ? (
                          <Pause className="w-4 h-4 fill-black" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-200' : 'text-slate-200'}`}>
                          {song.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Right: Duration & Delete Button */}
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatTime(song.duration)}
                      </span>

                      {/* Remove Song Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSong(song.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/40 transition-all opacity-75 group-hover:opacity-100"
                        title="Remove song from playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
