<script lang="ts">
 export let waveData: number[] = [];
 export let gridArea: string;

 function generatePath (data: number[]) : string {
     const strs: string[] = [];
     data.forEach((d: number, i: number) => strs.push(
         `${i / (waveData.length - 1)},${d}`
     ));
     return strs.join(' ');
 }
</script>

<div class="container" style:grid-area="{gridArea}">
    <svg class="scope" viewBox="-0.05 -1.05 1.1 2.1" preserveAspectRatio="none">
        <polyline class="scopeLine" points="{generatePath(waveData)}"/>
    </svg>
</div>

<style>
 .container {
     height: 100%;
     width: 10rem;
     background: white;
     align-self: center;
 }
 .scope {
     height: 100%;
     width: 100%;
 }
 .scopeLine {
     fill: none;
     stroke: black;
     vector-effect: non-scaling-stroke;
     stroke-width: .125rem;
     stroke-linecap: round;
     stroke-linejoin: round;
 }
</style>
