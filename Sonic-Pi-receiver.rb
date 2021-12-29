use_osc "localhost", 12004

samples = [
  [
    :bd_haus,
    :drum_snare_hard,
    :drum_cymbal_closed,
    :drum_cymbal_open,
    :drum_tom_hi_hard,
    :drum_tom_mid_hard,
    :drum_tom_lo_hard,
    :drum_splash_hard,
    :drum_cymbal_soft
  ], [
    :perc_bell,
    :perc_bell2,
    :perc_snap,
    :perc_snap2,
    :perc_swash,
    :perc_till,
    :perc_door,
    :perc_impact2,
    :perc_swoosh
  ], [
    :elec_twang,
    :elec_wood,
    :elec_pop,
    :elec_beep,
    :elec_blip,
    :elec_blip2,
    :elec_ping,
    :elec_bell,
    :elec_twip
  ],
  [
    #insert samples here
  ], [
    #insert samples here
  ], [
    #insert samples here
  ]
]

step = []
midiNotes = []

live_loop :receivedNewDrums do
  use_real_time
  a = sync "/osc*/wek/outputs"
  b = sync "/osc*/wek2/outputs"
  set :notes, a
  set :steps, b
  puts a
end

live_loop :receivedGenDrums do
  use_real_time
  c = sync "/osc*/wek3/outputs"
  d = sync "/osc*/wek4/outputs"
  set :genNotes, c
  set :genSteps, d
end

live_loop :playGenPatternOrNot do
  use_real_time
  e = sync "/osc*/wek5/outputs"
  set :playGenOrNot, e
end

live_loop :selectKit do
  use_real_time
  f = sync "/osc*/wek6/outputs"
  set :kit, f
end

a = 1.4

live_loop :playDrumPatterns, sync: :selectKit do
  midiNotes = get[:notes] || []
  step = get[:steps] || []
  genNote = get[:genNotes] || []
  genStep = get[:genSteps] || []
  playGen = get[:playGenOrNot]

  i = get[:kit][0].to_i

  dr = { samples[i][0] => 36,
         samples[i][1] =>  46,
         samples[i][2] =>  38,
         samples[i][3] => 42,
         samples[i][4] => 51,
         samples[i][5] =>  48,
         samples[i][6] =>  50,
         samples[i][7] =>  49,
         samples[i][8] => 45
         }

  if playGen
    if playGen[0] == 1 || playGen[0] == 2
      16.times do |i|
        for x in 0..midiNotes.length do
          if step[x] == i
            sample dr.select{|k,v| v == midiNotes[x]}.keys.first, amp: a
          end
        end
        osc "/druminfo", i, 0
        sleep 0.25
      end
    end

    if playGen[0] == 0 || playGen[0] == 2
      16.times do |i|
        for x in 0..genNote.length do
          if genStep[x] == i
            sample dr.select{|k,v| v == genNote[x]}.keys.first, amp: a
          end
        end
        osc "/druminfo", i, 1
        sleep 0.25
      end
    end
  else
    sleep 0.25
  end
end
