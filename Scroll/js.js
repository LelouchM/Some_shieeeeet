(function() {
const scroll = document.getElementById('scroll');
const scrollBar = document.getElementById('scroll-bar');
const content = document.getElementById('scrolling-content');
const container = document.getElementById('container');
  
if(container.offsetHeight < content.offsetHeight) {
scrollBar.style.display = 'block';
  
let currentScroll = 0;

scroll.addEventListener('mousedown', (e) => {
  const scrollBarTop = scrollBar.getBoundingClientRect().top + scrollY;
  const mousePosition = e.pageY - (scroll.getBoundingClientRect().top + scrollY);
 
  function mouseMove(e) {
    let scrollLength = (e.pageY - scrollBarTop) - mousePosition;
    
    changeScroll(scrollLength);
  }
  function mouseUp() {
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
    scroll.style.transition = '';
  }
  
  document.addEventListener('mousemove', mouseMove);
  document.addEventListener('mouseup', mouseUp);
  
  scroll.style.transition = 'initial';
  e.preventDefault();
});

scrollBar.addEventListener('click', (e) => {
  if (e.target.id != 'scroll') {
  const scrollBarTop = scrollBar.getBoundingClientRect().top + scrollY;
  changeScroll(e.pageY - scrollBarTop);
}
});

document.addEventListener('keydown', (e) => {
  if (e.keyCode === 40) {
    changeScroll(currentScroll + 20);
    return false;
  } else if (e.keyCode === 38) {
    changeScroll(currentScroll - 20);
    return false;
  }
});

container.addEventListener('wheel', (e) => {
  changeScroll(currentScroll + ((e.deltaY > 0)? 15 : -15));
});
  
scroll.addEventListener('touchstart', (e) => {
  const fingerPos = e.changedTouches[0].clientY -(scroll.getBoundingClientRect().top + scrollY);
  
  document.addEventListener('touchmove', handleMove);
  document.addEventListener('touchend', toucheEnd);
  
  function handleMove(e) {
    changeScroll(((e.changedTouches[0].clientY) -(scrollBar.getBoundingClientRect().top + scrollY)) - fingerPos);
    
  }
  
  function toucheEnd(e) {
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', toucheEnd);
    scroll.style.transition = '';
  }
  e.preventDefault();
  scroll.style.transition = 'initial';
});
                        
function changeScroll(scrollLength) {
  if (scrollLength < 0) {
    scrollLength = 0;
  } else if (scrollLength + scroll.offsetHeight > scrollBar.offsetHeight) {
    scrollLength = scrollBar.offsetHeight - scroll.offsetHeight;  
  }
  currentScroll = scrollLength;
  scroll.style.transform = `translateY(${scrollLength}px)`;
  
  changeContainerScroll(scrollLength);
}
  
function changeContainerScroll(scrollLength) {
  const maxContainerScroll = container.offsetHeight - content.offsetHeight;
  const maxScrolling = scrollBar.offsetHeight - scroll.offsetHeight;
  
  content.style.transform = `translateY(${scrollLength * (maxContainerScroll/maxScrolling)}px)`;
}  
}}());